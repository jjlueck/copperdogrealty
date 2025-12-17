const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const xml2js = require('xml2js');

// Configuration
const loginUrl = process.env.RETS_LOGIN_URL;
const username = process.env.RETS_USERNAME;
const password = process.env.RETS_PASSWORD;
const userAgent = 'RETS-Connector/1.2';
const retsVersion = 'RETS/1.7.2';

const jar = new CookieJar();
const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  headers: { 'User-Agent': userAgent, 'RETS-Version': retsVersion }
}));

const parseCompact = (xml) => {
    const results = [];
    const columnsMatch = xml.match(/<COLUMNS>\s*(.*?)\s*<\/COLUMNS>/);
    const dataMatches = xml.matchAll(/<DATA>\s*(.*?)\s*<\/DATA>/g);
    if (columnsMatch && dataMatches) {
        const columns = columnsMatch[1].split('\t');
        for (const match of dataMatches) {
            const data = match[1].split('\t');
            const obj = {};
            columns.forEach((col, index) => { if (col) obj[col] = data[index]; });
            results.push(obj);
        }
    }
    return results;
};

async function main() {
  try {
    if (!loginUrl || !username || !password) {
        throw new Error('RETS credentials not found in .env');
    }

    console.log('Connecting to RETS Server...');
    const loginResponse = await client.get(loginUrl, { auth: { username, password } });
    if (loginResponse.status !== 200) throw new Error('Login failed');

    const capabilityUrls = {};
    loginResponse.data.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) capabilityUrls[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    const resolveUrl = (pathStr) => {
        if (pathStr.startsWith('http')) return pathStr;
        const u = new URL(loginUrl);
        return `${u.protocol}//${u.host}${pathStr.startsWith('/') ? '' : '/'}${pathStr}`;
    };
    const metadataUrl = resolveUrl(capabilityUrls['GetMetadata']);

    console.log('Fetching City Lookup Values...');
    // Note: LookupName "City_Lkp_1" was identified in previous discovery
    const lookupResponse = await client.get(metadataUrl, {
        params: { Type: 'METADATA-LOOKUP_TYPE', ID: 'Property:City_Lkp_1', Format: 'COMPACT' },
        auth: { username, password }
    });

    const lookups = parseCompact(lookupResponse.data);
    
    // Map to simple { value: "Code", label: "Label" } format
    // Filter out empty or invalid entries if any
    const cities = lookups
        .filter(l => l.Value && l.LongValue)
        .map(l => ({
            value: l.Value,
            label: l.LongValue
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    console.log(`Found ${cities.length} cities.`);

    const outputPath = path.resolve(__dirname, '../app/constants/cities.json');
    fs.writeFileSync(outputPath, JSON.stringify(cities, null, 2));
    console.log(`Successfully wrote cities to ${outputPath}`);

    // Logout
    if (capabilityUrls['Logout']) await client.get(resolveUrl(capabilityUrls['Logout']), { auth: { username, password } });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
