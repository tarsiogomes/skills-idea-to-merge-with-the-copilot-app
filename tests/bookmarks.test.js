import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, generateSlug, loadBookmarks, normalizeUrl } from '../src/lib/bookmarks.ts';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(normalizeUrl('www.example.com/path'), normalizeUrl('https://www.example.com/path'));
});

test('generates short base62 slugs with the mona prefix', () => {
  assert.match(generateSlug(() => 0.1234), /^mona-[0-9a-zA-Z]{4}$/);
});

test('recovers safely from empty, corrupted, legacy, and non-array storage', () => {
  for (const stored of [null, '', '{broken json', '{"url":"https://legacy.example"}', '42']) {
    assert.doesNotThrow(() => loadBookmarks(stored));
    assert.deepEqual(loadBookmarks(stored), []);
  }
});

test('drops malformed entries from stored bookmark arrays', () => {
  const stored = JSON.stringify([
    { url: 'https://www.example.com', slug: 'mona-7fk2' },
    { url: 'javascript:alert(1)', slug: 'mona-abcd' },
    { url: 'https://bad.example', slug: 'invalid' },
    null,
  ]);

  assert.deepEqual(loadBookmarks(stored), [
    { url: 'https://www.example.com/', slug: 'mona-7fk2' },
  ]);
});

test('formats bookmarks with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
