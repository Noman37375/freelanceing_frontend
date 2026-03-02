/**
 * Currency list from API (open.er-api.com — free, no API key).
 * Used for searchable currency dropdown when setting project budget.
 */

export interface CurrencyItem {
  code: string;
  name: string;
  displayLabel: string;
}

const CURRENCIES_API = "https://open.er-api.com/v6/latest/USD";
let cachedCurrencies: CurrencyItem[] | null = null;

function getCurrencyName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Fetch all supported currency codes from API and build list with names (via Intl).
 */
export async function fetchCurrencies(): Promise<CurrencyItem[]> {
  if (cachedCurrencies?.length) return cachedCurrencies;

  const res = await fetch(CURRENCIES_API, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Failed to load currencies");

  const data = (await res.json()) as { rates?: Record<string, number> };
  const rates = data.rates ?? {};
  const codes = Object.keys(rates).sort();

  cachedCurrencies = codes.map((code) => {
    const name = getCurrencyName(code);
    return {
      code,
      name,
      displayLabel: `${code} – ${name}`,
    };
  });

  return cachedCurrencies;
}

/**
 * Filter currencies by search query (code or name).
 */
export function filterCurrencies(list: CurrencyItem[], query: string): CurrencyItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (c) =>
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  );
}
