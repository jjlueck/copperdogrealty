import { RetsClient, RetsVersion } from 'rets.js';

const retsUrl = 'https://8420-rets.paragonrels.com';
const retsUsername = 'YOUR_USERNAME';
const retsPassword = 'YOUR_PASSWORD';

export async function getListings() {
  const client = new RetsClient({
    url: retsUrl,
    username: retsUsername,
    password: retsPassword,
    version: RetsVersion.RETS_1_7_2,
  });

  try {
    await client.login();

    const results = await client.search({
      searchType: 'Property',
      class: 'RESI',
      query: '(LIST_87=ACT) AND (LIST_134=CONDO,TWNHME,SINGLE)',
      limit: 100,
    });

    return results.records;
  } catch (error) {
    console.error('Error fetching RETS data:', error);
    return [];
  } finally {
    await client.logout();
  }
}
