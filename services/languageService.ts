/**
 * Language list using ISO 639-1 codes resolved via Intl.DisplayNames.
 * No external API key required — names come from the device's built-in i18n.
 */

export interface LanguageItem {
  code: string;       // ISO 639-1 e.g. "en", "ur"
  name: string;       // Display name e.g. "English", "Urdu"
  displayLabel: string;
}

// Comprehensive ISO 639-1 language codes
const ISO_639_1_CODES: string[] = [
  'ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az',
  'bm','ba','eu','be','bn','bh','bi','bs','br','bg','my','ca','ch','ce',
  'ny','zh','cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo',
  'et','ee','fo','fj','fi','fr','ff','gl','ka','de','el','gn','gu','ht',
  'ha','he','hz','hi','ho','hu','ia','id','ie','ga','ig','ik','io','is',
  'it','iu','ja','jv','kl','kn','kr','ks','kk','km','ki','rw','ky','kv',
  'kg','ko','ku','kj','la','lb','lg','li','ln','lo','lt','lu','lv','gv',
  'mk','mg','ms','ml','mt','mi','mr','mh','mn','na','nv','nb','nd','ne',
  'ng','nn','no','ii','nr','oc','oj','cu','om','or','os','pa','pi','fa',
  'pl','ps','pt','qu','rm','rn','ro','ru','sa','sc','sd','se','sm','sg',
  'sr','gd','sn','si','sk','sl','so','st','es','su','sw','ss','sv','ta',
  'te','tg','th','ti','bo','tk','tl','tn','to','tr','ts','tt','tw','ty',
  'ug','uk','ur','uz','ve','vi','vo','wa','cy','wo','fy','xh','yi','yo',
  'za','zu',
];

let cachedLanguages: LanguageItem[] | null = null;

function getLanguageName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Build language list from ISO 639-1 codes using Intl.DisplayNames.
 * Returns a cached result after the first call.
 */
export function fetchLanguages(): LanguageItem[] {
  if (cachedLanguages?.length) return cachedLanguages;

  const list: LanguageItem[] = ISO_639_1_CODES
    .map((code) => {
      const name = getLanguageName(code);
      return { code, name, displayLabel: name };
    })
    .filter((l) => l.name && l.name !== l.code)
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedLanguages = list;
  return cachedLanguages;
}

/**
 * Filter languages by search query (name or code).
 */
export function filterLanguages(list: LanguageItem[], query: string): LanguageItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
  );
}
