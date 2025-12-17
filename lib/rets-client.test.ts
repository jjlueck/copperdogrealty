import { describe, it, expect, beforeAll, vi } from 'vitest';
import { RetsClient, PropertyFilter } from './rets-client';
import path from 'path';
import dotenv from 'dotenv';

// Mock next/cache
vi.mock('next/cache', () => ({
  unstable_cache: (fn: Function) => fn, // Simply return the function (or a wrapped version that calls it)
}));

// Load .env from project root for integration tests
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('RetsClient Unit Tests', () => {
  const mockConfig = {
    loginUrl: 'http://example.com/login',
    username: 'user',
    password: 'pass'
  };

  it('buildDmqlQuery should include Active status by default', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({});
    expect(query).toBe('(L_StatusCatID=1)');
  });

  it('buildDmqlQuery should handle minPrice', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({ minPrice: 200000 });
    expect(query).toContain('(L_AskingPrice=200000+)');
  });

  it('buildDmqlQuery should handle price range', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({ minPrice: 200000, maxPrice: 400000 });
    expect(query).toContain('(L_AskingPrice=200000-400000)');
  });

  it('buildDmqlQuery should handle city with spaces', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({ city: 'Spirit Lake' });
    expect(query).toContain('(L_City="Spirit Lake")');
  });

  it('buildDmqlQuery should handle minBeds', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({ minBeds: 3 });
    expect(query).toContain('(LM_Int1_11=3+)');
  });

  it('buildDmqlQuery should handle minBaths', () => {
    const client = new RetsClient(mockConfig);
    const query = client.buildDmqlQuery({ minBaths: 2 });
    expect(query).toContain('(LM_Dec_35=2+)');
  });

  it('buildDmqlQuery should combine multiple filters', () => {
    const client = new RetsClient(mockConfig);
    const filters: PropertyFilter = {
      minPrice: 300000,
      city: 'Milford',
      minBeds: 4
    };
    const query = client.buildDmqlQuery(filters);
    expect(query).toBe('(L_StatusCatID=1),(L_AskingPrice=300000+),(L_City="Milford"),(LM_Int1_11=4+)');
  });
});

describe('RetsClient Integration Tests', () => {
  // Only run if credentials are present
  const runIntegration = process.env.RETS_LOGIN_URL && process.env.RETS_USERNAME && process.env.RETS_PASSWORD;
  
  if (!runIntegration) {
    it.skip('Skipping integration tests: RETS credentials not found in .env', () => {});
    return;
  }

  const config = {
    loginUrl: process.env.RETS_LOGIN_URL!,
    username: process.env.RETS_USERNAME!,
    password: process.env.RETS_PASSWORD!
  };

  it('should search successfully using internal login/logout', async () => {
    const client = new RetsClient(config);
    
    // searchProperties now handles login/logout internally
    const listings = await client.searchProperties({ limit: 2 });
    
    expect(Array.isArray(listings)).toBe(true);
    if (listings.length > 0) {
      const first = listings[0];
      // Check for expected fields (Standard or System names might vary, but we expect *something*)
      expect(first).toHaveProperty('L_ListingID');
      expect(first).toHaveProperty('photos');
      expect(Array.isArray(first.photos)).toBe(true);

      // Test getListingDetails for the found ID
      const detail = await client.getListingDetails(first.L_ListingID);
      expect(detail).not.toBeNull();
      expect(detail).toHaveProperty('L_ListingID', first.L_ListingID);
    }
  }, 30000); // 30s timeout for network calls
});
