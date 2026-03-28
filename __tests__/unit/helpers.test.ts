import {
  formatCurrency,
  formatDate,
  getRelativeTime,
  truncateText,
  capitalize,
  toTitleCase,
  generateId,
  isValidEmail,
  validatePassword,
  getStatusColor,
  calculatePercentage,
  formatFileSize,
  getFileExtension,
  isAllowedFileType,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  generateAvatarUrl,
  calculateReadingTime,
  generateSlug,
  parseQueryString,
  buildQueryString,
  getInitials,
  formatPhoneNumber,
} from '@/utils/helpers';

// ─── formatCurrency ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });
  it('formats decimal amounts', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
  });
  it('formats PKR', () => {
    const result = formatCurrency(5000, 'PKR');
    expect(result).toContain('5,000');
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats an ISO date string to display format', () => {
    const result = formatDate('2026-01-15T00:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('Jan');
  });
  it('accepts a Date object', () => {
    const result = formatDate(new Date('2026-06-01T00:00:00Z'));
    expect(result).toContain('2026');
  });
});

// ─── getRelativeTime ──────────────────────────────────────────────────────────

describe('getRelativeTime', () => {
  it('returns "Just now" for < 60 seconds ago', () => {
    const recent = new Date(Date.now() - 10_000).toISOString();
    expect(getRelativeTime(recent)).toBe('Just now');
  });
  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(getRelativeTime(fiveMinAgo)).toBe('5m ago');
  });
  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000).toISOString();
    expect(getRelativeTime(twoHoursAgo)).toBe('2h ago');
  });
  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
    expect(getRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
  it('returns weeks ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400_000).toISOString();
    expect(getRelativeTime(twoWeeksAgo)).toBe('2w ago');
  });
  it('returns months ago', () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 86400_000).toISOString();
    expect(getRelativeTime(twoMonthsAgo)).toBe('2mo ago');
  });
});

// ─── truncateText ─────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('returns original text if within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });
  it('truncates and appends ellipsis', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });
});

// ─── capitalize / toTitleCase ─────────────────────────────────────────────────

describe('capitalize', () => {
  it('capitalises first letter and lowercases rest', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });
});

describe('toTitleCase', () => {
  it('title-cases every word', () => {
    expect(toTitleCase('hello world foo')).toBe('Hello World Foo');
  });
});

// ─── generateId ───────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
  it('generates unique IDs', () => {
    expect(generateId()).not.toBe(generateId());
  });
});

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('name+tag@sub.domain.org')).toBe(true);
  });
  it('rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

// ─── validatePassword ─────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('validates a strong password', () => {
    const result = validatePassword('StrongPass1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  it('rejects a password that is too short', () => {
    const result = validatePassword('Ab1');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('characters'))).toBe(true);
  });
  it('rejects a password missing uppercase', () => {
    const result = validatePassword('lowercase1');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
  });
  it('rejects a password missing a number', () => {
    const result = validatePassword('NoNumbers');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });
});

// ─── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns a string for known statuses', () => {
    expect(typeof getStatusColor('active')).toBe('string');
    expect(typeof getStatusColor('pending')).toBe('string');
    expect(typeof getStatusColor('cancelled')).toBe('string');
  });
  it('is case-insensitive', () => {
    expect(getStatusColor('ACTIVE')).toBe(getStatusColor('active'));
  });
  it('returns a fallback for unknown status', () => {
    const fallback = getStatusColor('unknown_xyz');
    expect(typeof fallback).toBe('string');
    expect(fallback.length).toBeGreaterThan(0);
  });
});

// ─── calculatePercentage ──────────────────────────────────────────────────────

describe('calculatePercentage', () => {
  it('calculates correct percentage', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33);
  });
  it('returns 0 when total is 0', () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });
});

// ─── formatFileSize ───────────────────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500 Bytes');
  });
  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });
  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });
});

// ─── getFileExtension ─────────────────────────────────────────────────────────

describe('getFileExtension', () => {
  it('extracts the extension', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf');
    expect(getFileExtension('image.PNG')).toBe('png');
  });
  it('returns empty string for files with no extension', () => {
    expect(getFileExtension('Makefile')).toBe('makefile');
  });
});

// ─── isAllowedFileType ────────────────────────────────────────────────────────

describe('isAllowedFileType', () => {
  it('returns true for allowed type', () => {
    expect(isAllowedFileType('image/png', ['image/png', 'image/jpeg'])).toBe(true);
  });
  it('returns false for disallowed type', () => {
    expect(isAllowedFileType('application/exe', ['image/png'])).toBe(false);
  });
});

// ─── debounce ─────────────────────────────────────────────────────────────────

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only calls fn once after the delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── throttle ────────────────────────────────────────────────────────────────

describe('throttle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls fn immediately then throttles subsequent calls', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 300);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ─── deepClone ────────────────────────────────────────────────────────────────

describe('deepClone', () => {
  it('clones primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBeNull();
  });
  it('clones arrays deeply', () => {
    const arr = [1, [2, 3]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    (cloned[1] as number[])[0] = 99;
    expect((arr[1] as number[])[0]).toBe(2);
  });
  it('clones objects deeply', () => {
    const obj = { a: { b: 1 } };
    const cloned = deepClone(obj);
    cloned.a.b = 99;
    expect(obj.a.b).toBe(1);
  });
  it('clones Date objects', () => {
    const d = new Date('2026-01-01');
    const cloned = deepClone(d);
    expect(cloned).toEqual(d);
    expect(cloned).not.toBe(d);
  });
});

// ─── isEmpty ─────────────────────────────────────────────────────────────────

describe('isEmpty', () => {
  it('returns true for null/undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });
  it('returns true for empty string/array/object', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });
  it('returns false for non-empty values', () => {
    expect(isEmpty('x')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

// ─── generateAvatarUrl ────────────────────────────────────────────────────────

describe('generateAvatarUrl', () => {
  it('returns a URL string containing the encoded name', () => {
    const url = generateAvatarUrl('John Doe');
    expect(typeof url).toBe('string');
    expect(url).toContain('John');
  });
});

// ─── calculateReadingTime ────────────────────────────────────────────────────

describe('calculateReadingTime', () => {
  it('returns at least 1 minute', () => {
    expect(calculateReadingTime('hello')).toBe(1);
  });
  it('calculates reading time for long text', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });
});

// ─── generateSlug ────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });
  it('removes special characters', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });
  it('collapses multiple hyphens', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
  });
});

// ─── parseQueryString / buildQueryString ─────────────────────────────────────

describe('parseQueryString', () => {
  it('parses key=value pairs', () => {
    const result = parseQueryString('status=active&page=2');
    expect(result).toEqual({ status: 'active', page: '2' });
  });
  it('returns empty object for empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });
});

describe('buildQueryString', () => {
  it('builds a query string from an object', () => {
    const qs = buildQueryString({ status: 'active', limit: 10 });
    expect(qs).toContain('status=active');
    expect(qs).toContain('limit=10');
  });
  it('omits null, undefined, and empty-string values', () => {
    const qs = buildQueryString({ a: null, b: undefined, c: '', d: 'keep' });
    expect(qs).toBe('d=keep');
  });
});

// ─── getInitials ─────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns first letters of each word, uppercased, max 2', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Alice')).toBe('A');
    expect(getInitials('First Middle Last')).toBe('FM');
  });
});

// ─── formatPhoneNumber ───────────────────────────────────────────────────────

describe('formatPhoneNumber', () => {
  it('formats a 10-digit number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });
  it('returns input unchanged if not exactly 10 digits', () => {
    expect(formatPhoneNumber('+1-800-555')).toBe('+1-800-555');
  });
});
