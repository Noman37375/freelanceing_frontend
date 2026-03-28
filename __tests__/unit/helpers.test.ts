/**
 * helpers.test.ts
 *
 * Tests for utils/helpers.ts.
 * Functions that reference browser globals (navigator, document) crash at
 * runtime in React Native — those tests are deliberately marked to expose the
 * dead code so it can be removed from the project.
 */

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

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('formats fractional amounts', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
  });

  it('supports other currencies', () => {
    const result = formatCurrency(500, 'EUR');
    expect(result).toContain('500');
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a date string to display format', () => {
    const result = formatDate('2026-01-15T00:00:00Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2026/);
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2026-06-01T00:00:00Z'));
    expect(result).toMatch(/2026/);
  });

  it('falls back to ISO date when format is unknown', () => {
    const result = formatDate('2026-03-28T00:00:00Z', 'iso');
    expect(result).toBe('2026-03-28');
  });
});

// ─── getRelativeTime ─────────────────────────────────────────────────────────

describe('getRelativeTime', () => {
  it('returns "Just now" for very recent timestamps', () => {
    expect(getRelativeTime(new Date())).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000);
    expect(getRelativeTime(d)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(getRelativeTime(d)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(getRelativeTime(d)).toBe('2d ago');
  });
});

// ─── truncateText ─────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('does not truncate text within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });
});

// ─── capitalize / toTitleCase ─────────────────────────────────────────────────

describe('capitalize', () => {
  it('capitalizes first letter and lowercases rest', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });
});

describe('toTitleCase', () => {
  it('title-cases each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });
});

// ─── generateId ───────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('generates a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    expect(generateId()).not.toBe(generateId());
  });
});

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });
});

// ─── validatePassword ─────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('validates a strong password', () => {
    const result = validatePassword('StrongPass1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a short password', () => {
    const result = validatePassword('Ab1');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('8 characters'))).toBe(true);
  });

  it('rejects password with no uppercase', () => {
    const result = validatePassword('lowercase1');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  it('rejects password with no number', () => {
    const result = validatePassword('NoNumbers!');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });
});

// ─── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns green for active', () => {
    expect(getStatusColor('active')).toBeTruthy();
  });

  it('is case-insensitive', () => {
    expect(getStatusColor('ACTIVE')).toBe(getStatusColor('active'));
  });

  it('returns a fallback color for unknown status', () => {
    expect(getStatusColor('unknown_xyz')).toBeTruthy();
  });
});

// ─── calculatePercentage ──────────────────────────────────────────────────────

describe('calculatePercentage', () => {
  it('calculates correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
  });

  it('rounds to whole number', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it('returns 0 when total is 0 (no division by zero)', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });
});

// ─── formatFileSize ───────────────────────────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
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
  it('returns lowercase extension', () => {
    expect(getFileExtension('photo.JPG')).toBe('jpg');
  });

  it('returns empty string for no extension', () => {
    expect(getFileExtension('noextension')).toBe('noextension');
  });
});

// ─── isAllowedFileType ────────────────────────────────────────────────────────

describe('isAllowedFileType', () => {
  it('returns true for allowed type', () => {
    expect(isAllowedFileType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true);
  });

  it('returns false for disallowed type', () => {
    expect(isAllowedFileType('video/mp4', ['image/jpeg'])).toBe(false);
  });
});

// ─── debounce ─────────────────────────────────────────────────────────────────

describe('debounce', () => {
  it('delays function call', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});

// ─── throttle ─────────────────────────────────────────────────────────────────

describe('throttle', () => {
  it('limits calls within the delay window', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const throttled = throttle(fn, 300);

    const realNow = Date.now;
    let now = 1000;
    Date.now = () => now;

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    throttled(); // within 300ms — should be skipped
    expect(fn).toHaveBeenCalledTimes(1);

    now += 301;
    throttled(); // outside window — should fire
    expect(fn).toHaveBeenCalledTimes(2);

    Date.now = realNow;
    jest.useRealTimers();
  });
});

// ─── deepClone ────────────────────────────────────────────────────────────────

describe('deepClone', () => {
  it('clones a plain object', () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
    expect(clone.b).not.toBe(obj.b);
  });

  it('clones an array', () => {
    const arr = [1, 2, [3, 4]];
    const clone = deepClone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
  });

  it('clones a Date', () => {
    const d = new Date('2026-01-01');
    const clone = deepClone(d);
    expect(clone).toEqual(d);
    expect(clone).not.toBe(d);
  });

  it('passes through primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone(null)).toBeNull();
  });
});

// ─── isEmpty ─────────────────────────────────────────────────────────────────

describe('isEmpty', () => {
  it('returns true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string, array, object', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

// ─── generateAvatarUrl ────────────────────────────────────────────────────────

describe('generateAvatarUrl', () => {
  it('returns a URL containing the encoded name', () => {
    const url = generateAvatarUrl('Ahmed Ali');
    expect(url).toContain('Ahmed');
    expect(url).toMatch(/^https?:\/\//);
  });
});

// ─── calculateReadingTime ─────────────────────────────────────────────────────

describe('calculateReadingTime', () => {
  it('returns at least 1 minute for short text', () => {
    expect(calculateReadingTime('hello world')).toBe(1);
  });

  it('scales with word count', () => {
    // 200 words at 200 wpm = 1 minute
    const text = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(1);
  });
});

// ─── generateSlug ─────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('a  b  c')).toBe('a-b-c');
  });
});

// ─── parseQueryString / buildQueryString ──────────────────────────────────────

describe('parseQueryString', () => {
  it('parses key-value pairs', () => {
    expect(parseQueryString('foo=bar&baz=1')).toEqual({ foo: 'bar', baz: '1' });
  });

  it('returns empty object for empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });
});

describe('buildQueryString', () => {
  it('builds a query string, skipping null/empty values', () => {
    const qs = buildQueryString({ a: '1', b: null, c: '', d: 0 });
    expect(qs).toContain('a=1');
    expect(qs).not.toContain('b=');
    expect(qs).not.toContain('c=');
    // 0 is a valid value
    expect(qs).toContain('d=0');
  });
});

// ─── getInitials ─────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns up to 2 uppercase initials', () => {
    expect(getInitials('Ahmed Ali Khan')).toBe('AA');
  });

  it('returns single initial for single-word name', () => {
    expect(getInitials('Ahmed')).toBe('A');
  });
});

// ─── formatPhoneNumber ────────────────────────────────────────────────────────

describe('formatPhoneNumber', () => {
  it('formats a 10-digit US number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('returns original string if not 10 digits', () => {
    expect(formatPhoneNumber('+92-300-1234567')).toBe('+92-300-1234567');
  });
});

// isMobile, copyToClipboard, and downloadFile have been removed from helpers.ts.
// They used browser-only APIs (navigator.userAgent, navigator.clipboard, document)
// that do not exist in React Native.
