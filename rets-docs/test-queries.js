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

    // 2. Get Metadata for Class RE_1 to find Bed/Bath fields
    console.log(`Fetching Metadata for Class: RE_1...`);
    const metadataResponse = await client.get(metadataUrl, {
        params: { Type: 'METADATA-TABLE', ID: 'Property:RE_1', Format: 'COMPACT' },
        auth: { username, password }
    });

    const fields = parseCompact(metadataResponse.data);
    
    console.log('\n--- Potential Bed/Bath Fields ---');
    console.log('SystemName | LongName | DataType');
    fields.forEach(f => {
        if (f.LongName && (f.LongName.toLowerCase().includes('bed') || f.LongName.toLowerCase().includes('bath'))) {
            console.log(`${f.SystemName} | ${f.LongName} | ${f.DataType}`);
        }
    });

    // 3. Search Properties (Limiting to 1 just to see values if needed, but metadata is key here)
    const searchUrl = resolveUrl(searchPath);
    // ... skipping search for this run to focus on metadata ...
    
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
