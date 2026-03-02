/**
 * Country calling codes from API (restcountries.com — free, no API key).
 * Used for phone number country code dropdown in complete profile and similar flows.
 */

export interface CountryCodeItem {
  code: string;       // ISO 3166-1 alpha-2 (e.g. PK, US)
  dialCode: string;   // e.g. +92, +1
  name: string;       // Country name
  displayLabel: string;
}

const COUNTRIES_API = 'https://restcountries.com/v3.1/all?fields=name,cca2,idd';

let cachedCountries: CountryCodeItem[] | null = null;

function parseDialCode(idd: { root?: string; suffixes?: string[] } | undefined): string {
  if (!idd?.root) return '';
  const root = idd.root.trim();
  const suffix = idd.suffixes?.[0]?.trim();
  if (suffix && suffix !== '') return root + suffix;
  return root;
}

/**
 * Fetch all countries with calling codes from API and build list.
 */
export async function fetchCountryCodes(): Promise<CountryCodeItem[]> {
  if (cachedCountries?.length) return cachedCountries;

  try {
    const res = await fetch(COUNTRIES_API, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Failed to load countries');

    const data = (await res.json()) as Array<{
      name: { common?: string };
      cca2?: string;
      idd?: { root?: string; suffixes?: string[] };
    }>;

    const list: CountryCodeItem[] = [];
    const seen = new Set<string>();

    for (const c of data) {
      const dialCode = parseDialCode(c.idd);
      if (!dialCode || !c.cca2) continue;
      const key = `${c.cca2}-${dialCode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const name = c.name?.common ?? c.cca2;
      list.push({
        code: c.cca2,
        dialCode,
        name,
        displayLabel: `${dialCode} ${name}`,
      });
    }

    list.sort((a, b) => a.name.localeCompare(b.name));
    cachedCountries = list;
    return cachedCountries;
  } catch (e) {
    console.warn('[countryCodeService] API failed, using fallback list:', e);
    return getFallbackCountryCodes();
  }
}

/**
 * Filter country codes by search query (name, code, or dial code).
 */
export function filterCountryCodes(list: CountryCodeItem[], query: string): CountryCodeItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.replace(/\s/g, '').toLowerCase().includes(q.replace(/\s/g, ''))
  );
}

/**
 * Fallback list of popular country codes if API is unavailable.
 */
function getFallbackCountryCodes(): CountryCodeItem[] {
  const fallback: Array<[string, string, string]> = [
    ['US', '+1', 'United States'],
    ['GB', '+44', 'United Kingdom'],
    ['PK', '+92', 'Pakistan'],
    ['IN', '+91', 'India'],
    ['CA', '+1', 'Canada'],
    ['AU', '+61', 'Australia'],
    ['DE', '+49', 'Germany'],
    ['FR', '+33', 'France'],
    ['AE', '+971', 'United Arab Emirates'],
    ['SA', '+966', 'Saudi Arabia'],
    ['EG', '+20', 'Egypt'],
    ['NG', '+234', 'Nigeria'],
    ['ZA', '+27', 'South Africa'],
    ['BD', '+880', 'Bangladesh'],
    ['PH', '+63', 'Philippines'],
    ['VN', '+84', 'Vietnam'],
    ['CN', '+86', 'China'],
    ['JP', '+81', 'Japan'],
    ['BR', '+55', 'Brazil'],
    ['MX', '+52', 'Mexico'],
  ];
  return fallback.map(([code, dialCode, name]) => ({
    code,
    dialCode,
    name,
    displayLabel: `${dialCode} ${name}`,
  }));
}
