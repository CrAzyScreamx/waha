import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

import { fetchBufferCached, URL_CACHE_TTL_MS } from '@waha/utils/fetch';

describe('fetchBufferCached', () => {
  let dir: string;
  let calls: number;
  const fetch = async (url: string) => {
    calls++;
    return Buffer.from(`${url}#${calls}`);
  };

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'waha-fetch-test-'));
    calls = 0;
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('downloads once, then serves from cache', async () => {
    const a = await fetchBufferCached('https://x/v.mp4', dir, fetch);
    const b = await fetchBufferCached('https://x/v.mp4', dir, fetch);
    expect(calls).toBe(1);
    expect(b.equals(a)).toBe(true);
  });

  it('caches per URL', async () => {
    await fetchBufferCached('https://x/1.mp4', dir, fetch);
    await fetchBufferCached('https://x/2.mp4', dir, fetch);
    expect(calls).toBe(2);
  });

  it('refetches after the TTL and prunes expired files', async () => {
    await fetchBufferCached('https://x/old.mp4', dir, fetch);
    const old = new Date(Date.now() - URL_CACHE_TTL_MS - 1000);
    for (const name of await fs.readdir(dir)) {
      await fs.utimes(path.join(dir, name), old, old);
    }
    // a miss on another URL prunes the expired file
    await fetchBufferCached('https://x/new.mp4', dir, fetch);
    await new Promise((r) => setTimeout(r, 50));
    expect((await fs.readdir(dir)).length).toBe(1);

    const fresh = await fetchBufferCached('https://x/old.mp4', dir, fetch);
    expect(calls).toBe(3);
    expect(fresh.toString()).toBe('https://x/old.mp4#3');
  });

  it('does not cache failed downloads', async () => {
    const failing = () => Promise.reject(new Error('boom'));
    await expect(fetchBufferCached('https://x/e', dir, failing)).rejects.toThrow(
      'boom',
    );
    await fetchBufferCached('https://x/e', dir, fetch);
    expect(calls).toBe(1);
  });
});
