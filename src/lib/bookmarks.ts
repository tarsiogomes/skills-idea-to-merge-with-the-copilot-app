export type Bookmark = {
  url: string;
  slug: string;
};

const slugAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const slugSpace = slugAlphabet.length ** 4;

export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  let candidate: string;
  if (value.startsWith('//')) {
    candidate = `https:${value}`;
  } else if (/^https?:\/\//i.test(value)) {
    candidate = value;
  } else if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    return null;
  } else {
    candidate = `https://${value}`;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

export function generateSlug(random: () => number = Math.random): string {
  let value = Math.min(Math.floor(random() * slugSpace), slugSpace - 1);
  let slug = '';

  for (let index = 0; index < 4; index += 1) {
    slug = slugAlphabet[value % slugAlphabet.length] + slug;
    value = Math.floor(value / slugAlphabet.length);
  }

  return `mona-${slug}`;
}

function validateBookmark(value: unknown): Bookmark | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;

  const entry = value as Record<string, unknown>;
  if (typeof entry.url !== 'string' || typeof entry.slug !== 'string') return null;
  if (!/^mona-[0-9a-zA-Z]{4}$/.test(entry.slug)) return null;

  const url = normalizeUrl(entry.url);
  if (!url) return null;

  return { url, slug: entry.slug };
}

export function loadBookmarks(serialized: string | null | undefined): Bookmark[] {
  if (!serialized) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): Bookmark[] => {
      const bookmark = validateBookmark(entry);
      return bookmark ? [bookmark] : [];
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
