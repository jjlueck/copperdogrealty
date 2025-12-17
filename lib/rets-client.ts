import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { unstable_cache } from 'next/cache';

export interface RetsConfig {
  loginUrl: string;
  username: string;
  password: string;
}

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  minBeds?: number;
  minBaths?: number;
  limit?: number;
}

export class RetsClient {
  private client: AxiosInstance;
  private jar: CookieJar;
  private config: RetsConfig;
  private capabilityUrls: Record<string, string> = {};

  constructor(config: RetsConfig) {
    this.config = config;
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: {
        'User-Agent': 'RETS-Connector/1.2',
        'RETS-Version': 'RETS/1.7.2',
      },
    }));
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const u = new URL(this.config.loginUrl);
    return `${u.protocol}//${u.host}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  async login(): Promise<void> {
    console.log(`Connecting to RETS Server: ${this.config.loginUrl}`);
    const response = await this.client.get(this.config.loginUrl, {
      auth: { username: this.config.username, password: this.config.password },
    });

    if (response.status !== 200) {
      throw new Error(`Login failed. Status: ${response.status}`);
    }

    const lines = response.data.split('\n');
    lines.forEach((line: string) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        this.capabilityUrls[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }

  async logout(): Promise<void> {
    if (this.capabilityUrls['Logout']) {
      await this.client.get(this.resolveUrl(this.capabilityUrls['Logout']), {
        auth: { username: this.config.username, password: this.config.password },
      });
    }
    this.jar.removeAllCookiesSync();
  }

  private parseCompact(xml: string): any[] {
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
  }

  buildDmqlQuery(filters: PropertyFilter): string {
    // Base query: Active listings
    // L_StatusCatID=1 (Active)
    const criteria: string[] = ['(L_StatusCatID=1)'];

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice ?? 0;
      // Use + for open-ended range if no max is strictly defined but logic implies range
      const range = filters.maxPrice ? `${min}-${filters.maxPrice}` : `${min}+`;
      criteria.push(`(L_AskingPrice=${range})`);
    }

    if (filters.city) {
      criteria.push(`(L_City="${filters.city}")`);
    }

    if (filters.minBeds !== undefined) {
      criteria.push(`(LM_Int1_11=${filters.minBeds}+)`);
    }

    if (filters.minBaths !== undefined) {
      criteria.push(`(LM_Dec_35=${filters.minBaths}+)`);
    }


    return criteria.join(',');
  }

  // --- Public Methods to be used by API Routes ---

  // Original searchProperties logic, but made private and to be wrapped by cache
  private async _searchProperties(filters: PropertyFilter = {}): Promise<any[]> {
    if (!this.capabilityUrls['Search']) throw new Error('Not logged in or no Search capability');

    const query = this.buildDmqlQuery(filters);
    console.log(`[RETS] Searching properties with query: ${query}`);

    const searchUrl = this.resolveUrl(this.capabilityUrls['Search']);
    const response = await this.client.get(searchUrl, {
      params: {
        SearchType: 'Property',
        Class: 'RE_1',
        Query: query,
        QueryType: 'DMQL2',
        Count: 1,
        Format: 'COMPACT-DECODED',
        Limit: filters.limit || 10,
        StandardNames: 0, // Request System Names to ensure we get custom fields like LM_Int1_11
      },
      auth: { username: this.config.username, password: this.config.password },
    });

    const listings = this.parseCompact(response.data);
    
    // Fetch photos for each listing
    const listingsWithPhotos = await Promise.all(listings.map(async (listing) => {
        const listingId = listing.ListingID || listing.L_ListingID || listing.L_DisplayId;
        const photos = await this.fetchPhotos(listingId);
        return { ...listing, photos };
    }));

    return listingsWithPhotos;
  }

  // Cached version of searchProperties
  public async searchProperties(filters: PropertyFilter = {}): Promise<any[]> {
    // Generate a consistent cache key from filters
    const filterKey = JSON.stringify(filters); 
    
    // unstable_cache expects a function that takes arguments that form part of the cache key
    const cachedFn = unstable_cache(
      async (keyFilters: string) => { // keyFilters is the stringified filters
        const parsedFilters = JSON.parse(keyFilters);
        // Ensure login happens inside the cached function's execution context
        await this.login(); 
        const result = await this._searchProperties(parsedFilters);
        await this.logout();
        return result;
      },
      [`properties-search-${filterKey}`], // Dynamic cache key including filters
      {
        revalidate: 43200, // Revalidate every 12 hours (60 seconds * 60 minutes * 12 hours)
        tags: ['properties'], // Tag for on-demand revalidation
      }
    );

    return cachedFn(filterKey);
  }

  private async _getListingDetails(listingId: string): Promise<any | null> {
    if (!this.capabilityUrls['Search']) throw new Error('Not logged in or no Search capability');

    // Query for exact Listing ID. 
    // Note: Use SystemName 'L_ListingID' as it is reliable for search.
    const query = `(L_ListingID=${listingId})`;
    console.log(`[RETS] Fetching details for listing ${listingId} with query: ${query}`);

    const searchUrl = this.resolveUrl(this.capabilityUrls['Search']);
    const response = await this.client.get(searchUrl, {
      params: {
        SearchType: 'Property',
        Class: 'RE_1',
        Query: query,
        QueryType: 'DMQL2',
        Count: 1,
        Format: 'COMPACT-DECODED',
        Limit: 1,
        StandardNames: 0, // Request System Names to get ALL fields
      },
      auth: { username: this.config.username, password: this.config.password },
    });

    const listings = this.parseCompact(response.data);
    if (listings.length === 0) return null;

    const listing = listings[0];
    const photos = await this.fetchPhotos(listingId);
    
    return { ...listing, photos };
  }

  public async getListingDetails(listingId: string): Promise<any | null> {
    const cachedFn = unstable_cache(
      async (id: string) => {
        await this.login();
        const result = await this._getListingDetails(id);
        await this.logout();
        return result;
      },
      [`property-details-${listingId}`],
      {
        revalidate: 43200,
        tags: ['properties', `property-${listingId}`],
      }
    );

    return cachedFn(listingId);
  }

  async fetchPhotos(listingId: string): Promise<string[]> {
    if (!this.capabilityUrls['GetObject'] || !listingId) return [];
    
    const photos: string[] = [];
    try {
      const getObjectUrl = this.resolveUrl(this.capabilityUrls['GetObject']);
      const response = await this.client.get(getObjectUrl, {
        params: {
          Type: 'Photo',
          Resource: 'Property',
          ID: `${listingId}:*`,
          Location: 1,
        },
        auth: { username: this.config.username, password: this.config.password },
      });

      const contentType = response.headers['content-type'];
      const boundaryMatch = contentType?.match(/boundary=(.+)/);
      const boundary = boundaryMatch ? boundaryMatch[1] : null;

      if (boundary) {
        const parts = response.data.split(`--${boundary}`);
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
    return photos;
  }
}
