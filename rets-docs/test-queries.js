const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Adjust path to your .env file
console.log('DEBUG: RETS_LOGIN_URL from .env:', process.env.RETS_LOGIN_URL);
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const xml2js = require('xml2js');

// Helper to parse RETS XML response
const parseRetsResponse = async (xmlData) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  try {
    return await parser.parseStringPromise(xmlData);
  } catch (err) {
    console.error('XML Parse Error:', err);
    return null;
  }
};

// Custom COMPACT parser
const parseCompact = (xml) => {
  const results = [];
  const columnsMatch = xml.match(/<COLUMNS>\s*(.*?)\s*<\/COLUMNS>/);
  const dataMatches = xml.matchAll(/<DATA>\s*(.*?)\s*<\/DATA>/g);

  if (columnsMatch) {
    const columns = columnsMatch[1].split('\t');
    for (const match of dataMatches) {
      const data = match[1].split('\t');
      const obj = {};
      columns.forEach((col, index) => {
        if (col) obj[col] = data[index];
      });
      results.push(obj);
    }
  }
  return results;
};

async function main() {
  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;
  
  if (!loginUrl || !username || !password) {
    console.error('Error: RETS credentials (RETS_LOGIN_URL, RETS_USERNAME, RETS_PASSWORD) not configured in .env');
    process.exit(1);
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
    console.log(`Connecting to RETS Server: ${loginUrl}`);
    const loginResponse = await client.get(loginUrl, {
      auth: { username, password }
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed. Status: ${loginResponse.status}`);
    }
    console.log('Login Successful!');

    // Parse Capabilities
    const capabilityUrls = {};
    const lines = loginResponse.data.split('\n');
    lines.forEach((line) => {
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

    console.log(`Capabilities - Search: ${searchPath}, GetObject: ${getObjectPath}`);

    const resolveUrl = (path) => {
      if (path.startsWith('http')) return path;
      const u = new URL(loginUrl);
      return `${u.protocol}//${u.host}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const metadataUrl = resolveUrl(capabilityUrls['GetMetadata']);

    // 2. Get Lookup Values for City_Lkp_1
    console.log(`Fetching Lookup Values for City_Lkp_1...`);
    const lookupResponse = await client.get(metadataUrl, {
        params: { Type: 'METADATA-LOOKUP_TYPE', ID: 'Property:City_Lkp_1', Format: 'COMPACT' },
        auth: { username, password }
    });

    const lookups = parseCompact(lookupResponse.data);
    console.log(`Found ${lookups.length} lookup values.`);
    
    const targetCities = ['spirit lake', 'okoboji', 'arnolds park', 'milford', 'lake park', 'wahpeton'];
    
    console.log('--- City Lookup Codes ---');
    targetCities.forEach(city => {
        const match = lookups.find(l => l.LongValue && l.LongValue.toLowerCase() === city);
        if (match) {
            console.log(`"${match.LongValue}" -> Code: "${match.Value}"`);
        } else {
            console.log(`"${city}" -> NOT FOUND`);
        }
    });

    /*
    // 3. Test the failing City Query
    ...
    */

    // 3. Fetch Photos for each listing
    const listingsWithPhotos = await Promise.all(listings.map(async (listing) => {
        // Handle both Standard and System names just in case
        const listingId = listing.ListingID || listing.L_ListingID || listing.L_DisplayId;
        let photos = [];

        if (getObjectPath && listingId) {
            try {
                const getObjectUrl = resolveUrl(getObjectPath);
                console.log(`Fetching photos for listing ${listingId} from ${getObjectUrl}`);
                const photoResponse = await client.get(getObjectUrl, {
                    params: {
                        Type: 'Photo',
                        Resource: 'Property',
                        ID: `${listingId}:*`, 
                        Location: 1 // Request URLs
                    },
                    auth: { username, password }
                });

                const contentType = photoResponse.headers['content-type'];
                const boundaryMatch = contentType?.match(/boundary=(.+)/);
                const boundary = boundaryMatch ? boundaryMatch[1] : null;

                if (boundary) {
                    const parts = photoResponse.data.split(`--${boundary}`);
                    for (let i = 1; i < parts.length - 1; i++) { // Skip first empty and last -- part
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
                } else {
                    console.warn(`No boundary found in photo response for listing ${listingId}. Content-Type: ${contentType}`);
                }
            } catch (err) {
                console.error(`Error fetching photos for ${listingId}:`, err.message);
            }
        }
        
        return {
            ...listing,
            photos
        };
    }));

    console.log('\n--- Retrieved Listings with Photos ---');
    console.log(JSON.stringify(listingsWithPhotos, null, 2));


    // 4. Logout
    if (logoutPath) {
      const logoutUrl = resolveUrl(logoutPath);
      await client.get(logoutUrl, {
        auth: { username, password }
      });
      console.log('Logged out successfully.');
    }

  } catch (error) {
    console.error('API Error:', error.message);
    process.exit(1);
  }
}

main();