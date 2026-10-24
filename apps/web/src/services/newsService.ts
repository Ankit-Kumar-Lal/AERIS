export type NewsCategory =
  | 'Flood'
  | 'Disease Outbreak'
  | 'Weather'
  | 'Water Quality'
  | 'Health Advisory';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  relativeTime: string;
  category: NewsCategory;
  state: string;
  is_sample?: boolean;
}

export interface NewsResponse {
  items: NewsItem[];
  cached_at: string;
  total: number;
  source: string;
  is_sample: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// TODO: Fallback mock data used ONLY when backend API endpoint is unreachable or offline.
// When active, the UI explicitly flags items with a "Sample Data" badge.
const FALLBACK_SAMPLE_NEWS: NewsItem[] = [
  {
    id: 'sample-1',
    title: 'Assam: Dhansiri River Crosses Danger Mark; Local PHCs Mobilise Diarrhoeal Surveillance',
    source: 'The Assam Tribune',
    url: 'https://assamtribune.com',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    relativeTime: '1h ago',
    category: 'Flood',
    state: 'Assam',
    is_sample: true,
  },
  {
    id: 'sample-2',
    title: 'Meghalaya Health Dept Issues Pre-Monsoon Advisory on Water-Borne Gastrointestinal Infections',
    source: 'Shillong Times',
    url: 'https://theshillongtimes.com',
    publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    relativeTime: '3h ago',
    category: 'Disease Outbreak',
    state: 'Meghalaya',
    is_sample: true,
  },
  {
    id: 'sample-3',
    title: 'Churachandpur Health Centre Reports Spike in Enteric Fever & Acute Diarrhoeal Cases',
    source: 'Imphal Free Press',
    url: 'https://ifp.co.in',
    publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    relativeTime: '5h ago',
    category: 'Disease Outbreak',
    state: 'Manipur',
    is_sample: true,
  },
  {
    id: 'sample-4',
    title: 'IMD Issues Heavy Rainfall Alert Across Arunachal Foothills & Upper Brahmaputra Valley',
    source: 'Arunachal Times',
    url: 'https://arunachaltimes.in',
    publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    relativeTime: '7h ago',
    category: 'Weather',
    state: 'Arunachal Pradesh',
    is_sample: true,
  },
  {
    id: 'sample-5',
    title: 'Mizoram Public Health Engineering Tests Community Drinking Wells for Coliform Pathogen Load',
    source: 'Aizawl Post',
    url: 'https://aizawlpost.com',
    publishedAt: new Date(Date.now() - 11 * 3600000).toISOString(),
    relativeTime: '11h ago',
    category: 'Water Quality',
    state: 'Mizoram',
    is_sample: true,
  },
  {
    id: 'sample-6',
    title: 'Tripura State NHM Deploys Mobile Testing Vans & Chlorine Tablets in Submerged Habitations',
    source: 'Tripura Chronicle',
    url: 'https://tripurachronicle.in',
    publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    relativeTime: '14h ago',
    category: 'Health Advisory',
    state: 'Tripura',
    is_sample: true,
  },
];

/**
 * Auto-detect news category from headline text keywords
 */
export function detectCategoryFromHeadline(headline: string): NewsCategory {
  const low = headline.toLowerCase();
  if (
    /diarrhoea|diarrhea|cholera|typhoid|dengue|malaria|hepatitis|fever|outbreak|cases|infection|epidemic|encephalitis|je\b|pathogen|enteric/.test(
      low
    )
  ) {
    return 'Disease Outbreak';
  }
  if (
    /water contamination|contaminated water|drinking water|potable|tube-well|tubewell|coliform|arsenic|fluoride|water supply|filtration|chlorin|water quality/.test(
      low
    )
  ) {
    return 'Water Quality';
  }
  if (
    /flood|inundat|submerg|waterlog|river|brahmaputra|barrage|deluge|erosion|overflow|breach|embankment/.test(
      low
    )
  ) {
    return 'Flood';
  }
  if (
    /weather|rain|monsoon|cloudburst|imd|forecast|cyclone|thunderstorm|storm|squall|downpour|warning/.test(
      low
    )
  ) {
    return 'Weather';
  }
  return 'Health Advisory';
}

/**
 * Auto-detect Northeast India state from headline keywords
 */
export function detectStateFromHeadline(headline: string): string {
  const low = headline.toLowerCase();
  if (/assam|guwahati|lakhimpur|dhakuakhana|majuli|dibrugarh|silchar|jorhat|barpeta|golaghat|tezpur|sonitpur|nagaon|cachar|dhubri|kamrup/.test(low)) {
    return 'Assam';
  }
  if (/arunachal|itanagar|pasighat|tawang|ziro|siang|lohit|subansiri/.test(low)) {
    return 'Arunachal Pradesh';
  }
  if (/manipur|imphal|churachandpur|bishnupur|thoubal|senapati/.test(low)) {
    return 'Manipur';
  }
  if (/meghalaya|shillong|mawsynram|cherrapunji|sohra|tura|khasi|garo|jaintia/.test(low)) {
    return 'Meghalaya';
  }
  if (/mizoram|aizawl|champhai|lunglei|kolasib/.test(low)) {
    return 'Mizoram';
  }
  if (/nagaland|kohima|dimapur|mokokchung/.test(low)) {
    return 'Nagaland';
  }
  if (/sikkim|gangtok|namchi|mangan|gyalshing/.test(low)) {
    return 'Sikkim';
  }
  if (/tripura|agartala|dhalai|dharmanagar|unakoti/.test(low)) {
    return 'Tripura';
  }
  return 'Northeast';
}

/**
 * Fetch Northeast India Health & Water news from the backend endpoint.
 * Falls back to curated, labeled sample data if backend is offline.
 */
export async function fetchNortheastNews(category?: string): Promise<NewsResponse> {
  const catParam = category && category.toLowerCase() !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const url = `${API_BASE}/news/northeast${catParam}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`News endpoint responded with status ${res.status}`);
    }

    const data: NewsResponse = await res.json();
    return data;
  } catch {
    // Graceful fallback to sample data when offline or backend unavailable
    let filtered = FALLBACK_SAMPLE_NEWS;
    if (category && category.toLowerCase() !== 'all') {
      const cLower = category.toLowerCase();
      filtered = FALLBACK_SAMPLE_NEWS.filter((item) => {
        if (cLower === 'disease') return item.category === 'Disease Outbreak';
        if (cLower === 'water') return item.category === 'Water Quality';
        return item.category.toLowerCase() === cLower;
      });
    }

    return {
      items: filtered,
      cached_at: new Date().toISOString(),
      total: filtered.length,
      source: 'sample_fallback',
      is_sample: true,
    };
  }
}
