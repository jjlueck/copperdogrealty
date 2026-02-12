#!/usr/bin/env node
/**
 * Fetches a single listing by MLS ID from the RETS/IDX feed and outputs
 * the full raw response. Use: node rets-docs/fetch-listing.js 260005
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const listingId = process.argv[2] || '260005';

const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const parseCompact = (xml) => {
  const results = [];
  const columnsMatch = xml.match(/<COLUMNS>\s*(.*?)\s*<\/COLUMNS>/);
  const dataMatches = xml.matchAll(/<DATA>\s*(.*?)\s*<\/DATA>/g);
  if (columnsMatch) {
    const columns = columnsMatch[1].split('\t');
    for (const match of dataMatches) {
      const data = match[1].split('\t');
      const obj = {};
      columns.forEach((col, i) => { if (col) obj[col] = data[i]; });
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
    console.error('Missing RETS credentials in .env');
    process.exit(1);
  }

  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: { 'User-Agent': 'RETS-Connector/1.2', 'RETS-Version': 'RETS/1.7.2' }
  }));

  try {
    const loginRes = await client.get(loginUrl, { auth: { username, password } });
    if (loginRes.status !== 200) throw new Error('Login failed');

    const capabilityUrls = {};
    loginRes.data.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) capabilityUrls[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    const resolveUrl = (p) => p.startsWith('http') ? p : `${new URL(loginUrl).origin}${p.startsWith('/') ? '' : '/'}${p}`;
    const searchUrl = resolveUrl(capabilityUrls['Search']);

    const query = `(L_ListingID=${listingId})`;
    const searchRes = await client.get(searchUrl, {
      params: {
        SearchType: 'Property',
        Class: 'RE_1',
        Query: query,
        QueryType: 'DMQL2',
        Count: 1,
        Format: 'COMPACT-DECODED',
        Limit: 1,
        StandardNames: 0
      },
      auth: { username, password }
    });

    const listings = parseCompact(searchRes.data);
    if (listings.length === 0) {
      console.error(`Listing ${listingId} not found.`);
      process.exit(1);
    }

    const listing = listings[0];

    // Highlight brokerage-related fields for the CopperDog feature
    const brokerageFields = [
      'L_ListOffice1', 'L_ListOffice2', 'L_ListOffice3',
      'LO1_OrganizationName', 'LO1_ShortName', 'LO1_HiddenOrgID', 'LO1_BranchOfOrgID',
      'LA1_UserFirstName', 'LA1_UserLastName', 'LA1_LoginName'
    ];

    console.log('=== BROKERAGE-RELATED FIELDS (for CopperDog filtering) ===\n');
    brokerageFields.forEach(f => {
      if (listing[f] !== undefined && listing[f] !== '') {
        console.log(`${f}: ${listing[f]}`);
      }
    });

    console.log('\n=== FULL RAW LISTING (all non-empty fields) ===\n');
    const nonEmpty = Object.fromEntries(
      Object.entries(listing).filter(([, v]) => v !== undefined && v !== '')
    );
    console.log(JSON.stringify(nonEmpty, null, 2));

    if (capabilityUrls['Logout']) {
      await client.get(resolveUrl(capabilityUrls['Logout']), { auth: { username, password } });
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
