import { NextResponse } from 'next/server';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import xml2js from 'xml2js';

export const dynamic = 'force-dynamic';

// Helper to parse RETS XML response
const parseRetsResponse = async (xmlData: string) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  try {
    return await parser.parseStringPromise(xmlData);
  } catch (err) {
    console.error('XML Parse Error:', err);
    return null;
  }
};

// Custom COMPACT parser
const parseCompact = (xml: string) => {
  const results: any[] = [];
  const columnsMatch = xml.match(/<COLUMNS>\s*(.*?)\s*<\/COLUMNS>/);
  const dataMatches = xml.matchAll(/<DATA>\s*(.*?)\s*<\/DATA>/g);

  if (columnsMatch) {
    const columns = columnsMatch[1].split('\t');
    for (const match of dataMatches) {
      const data = match[1].split('\t');
      const obj: any = {};
      columns.forEach((col, index) => {
        if (col) obj[col] = data[index];
      });
      results.push(obj);
    }
  }
  return results;
};

export async function GET() {
  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;
  
  if (!loginUrl || !username || !password) {
    return NextResponse.json({ error: 'RETS credentials not configured' }, { status: 500 });
  }

  const userAgent = 'RETS-Connector/1.2';
  const retsVersion = 'RETS/1.7.2';

  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
      'User-Agent': userAgent,
      'RETS-Version': retsVersion
    }
  }));

  try {
    // 1. Login
    console.log(`Connecting to RETS Server: ${loginUrl} ${username} ${password}`);
    const loginResponse = await client.get(loginUrl, {
      auth: { username, password }
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed. Status: ${loginResponse.status}`);
    }

    // Parse Capabilities
    const capabilityUrls: Record<string, string> = {};
    const lines = loginResponse.data.split('\n');
    lines.forEach((line: string) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        capabilityUrls[key] = value;
      }
    });

    const searchPath = capabilityUrls['Search'];
    const getObjectPath = capabilityUrls['GetObject'];
    const logoutPath = capabilityUrls['Logout'];

    const resolveUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      const u = new URL(loginUrl);
      return `${u.protocol}//${u.host}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    if (!searchPath) {
        throw new Error('No Search capability found');
    }

    // 2. Search Properties
    // Based on rets/listings.txt, Class is RE_1 and Active status is L_StatusCatID=1
    const searchUrl = resolveUrl(searchPath);
    console.log(`Searching properties at: ${searchUrl}`);
    
    const searchResponse = await client.get(searchUrl, {
      params: {
        SearchType: 'Property',
        Class: 'RE_1',
        Query: '(L_StatusCatID=1)',
        QueryType: 'DMQL2',
        Count: 1,
        Format: 'COMPACT-DECODED',
        Limit: 5,
        StandardNames: 1
      },
      auth: { username, password }
    });

    const listings = parseCompact(searchResponse.data);
    console.log(`Found ${listings.length} listings`);

    // 3. Fetch Photos for each listing
    const listingsWithPhotos = await Promise.all(listings.map(async (listing) => {
        const listingId = listing.L_ListingID || listing.L_DisplayId;
        let photos: string[] = [];

        if (getObjectPath && listingId) {
            try {
                const getObjectUrl = resolveUrl(getObjectPath);
                const photoResponse = await client.get(getObjectUrl, {
                    params: {
                        Type: 'Photo',
                        Resource: 'Property',
                        ID: `${listingId}:*`, 
                        Location: 1 // URLs
                    },
                    auth: { username, password }
                });

                const contentType = photoResponse.headers['content-type'];
                const boundaryMatch = contentType?.match(/boundary=(.+)/); // Optional chaining just in case
                const boundary = boundaryMatch ? boundaryMatch[1] : null;

                if (boundary) {
                    const parts = photoResponse.data.split(`--${boundary}`);
                     // Skip the first empty part and the last "--" part
                    for (let i = 1; i < parts.length - 1; i++) {
                        const part = parts[i];
                        const locationMatch = part.match(/Location: (.+)/);
                        if (locationMatch) {
                            let url = locationMatch[1].trim();
                            if (url.startsWith('//')) {
                                url = `https:${url}`;
                            }
                            photos.push(url);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error fetching photos for ${listingId}:`, err);
            }
        }
        
        return {
            ...listing,
            photos
        };
    }));


    // 4. Logout
    if (logoutPath) {
      const logoutUrl = resolveUrl(logoutPath);
      await client.get(logoutUrl, {
        auth: { username, password }
      });
    }

    return NextResponse.json(listingsWithPhotos);

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
