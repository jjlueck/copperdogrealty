require('dotenv').config();
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
    // 1. Login
    const loginResponse = await client.get(loginUrl, { auth: { username, password } });
    if (loginResponse.status !== 200) throw new Error('Login failed');

    const capabilityUrls = {};
    loginResponse.data.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) capabilityUrls[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    const resolveUrl = (path) => {
        if (path.startsWith('http')) return path;
        const u = new URL(loginUrl);
        return `${u.protocol}//${u.host}${path.startsWith('/') ? '' : '/'}${path}`;
    };
    const metadataUrl = resolveUrl(capabilityUrls['GetMetadata']);

    // 2. Get Class (Assuming Property:RE_1 from previous context, but let's be dynamic if possible or just hardcode RE_1 as seen in listings.txt)
    // from listings.txt: Inspecting Fields (METADATA-TABLE) for Class: RE_1...
    const targetClass = 'RE_1'; 

    console.log(`Fetching Fields for Class: ${targetClass}...`);
    const tableResponse = await client.get(metadataUrl, {
        params: { Type: 'METADATA-TABLE', ID: `Property:${targetClass}`, Format: 'COMPACT' },
        auth: { username, password }
    });

    const fields = parseCompact(tableResponse.data);
    
    console.log('SystemName,LongName,DataType');
    fields.forEach(f => {
        console.log(`${f.SystemName},${f.LongName},${f.DataType}`);
    });

    // Logout
    if (capabilityUrls['Logout']) await client.get(resolveUrl(capabilityUrls['Logout']), { auth: { username, password } });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
