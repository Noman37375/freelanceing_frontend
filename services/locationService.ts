/**
 * Location search service using Open-Meteo Geocoding API (free, no API key).
 * Used for LinkedIn-style location autocomplete when creating projects.
 */

export interface LocationSuggestion {
  id: string;
  name: string;
  region?: string;
  country: string;
  displayName: string;
}

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REQUEST_DELAY_MS = 300;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Search for locations (cities) by name. Debounced and rate-limited.
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal | null
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: "8",
    language: "en",
    format: "json",
  });

  const res = await fetch(`${GEOCODING_URL}?${params.toString()}`, {
    signal: signal ?? null,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { results?: Array<{ id: number; name: string; admin1?: string; country?: string; country_code?: string }> };
  const results = data.results ?? [];

  return results.map((r) => ({
    id: `loc-${r.id}-${r.name}-${r.country_code ?? ""}`,
    name: r.name,
    region: r.admin1,
    country: r.country ?? "",
    displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

/**
 * Debounced search: waits REQUEST_DELAY_MS after last call before fetching.
 */
export function searchLocationsDebounced(
  query: string,
  onResult: (suggestions: LocationSuggestion[]) => void,
  onError?: (err: unknown) => void
): void {
  if (debounceTimer) clearTimeout(debounceTimer);

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    onResult([]);
    return;
  }

  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    try {
      const suggestions = await searchLocations(trimmed);
      onResult(suggestions);
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        onError?.(err);
      }
      onResult([]);
    }
  }, REQUEST_DELAY_MS);
}
