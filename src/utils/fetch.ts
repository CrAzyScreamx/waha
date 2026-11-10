import axios from 'axios';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { Agent as HttpsAgent } from 'https';
import * as os from 'os';
import * as path from 'path';
// @ts-ignore
import * as UserAgent from 'user-agents';

const InsecureHttpsAgent = new HttpsAgent({
  rejectUnauthorized: false,
});

export async function fetchBuffer(url: string): Promise<Buffer> {
  const userAgent = new UserAgent();
  return axios
    .get(url, {
      responseType: 'arraybuffer',
      httpsAgent: InsecureHttpsAgent,
      headers: {
        'User-Agent': userAgent.toString(),
      },
    })
    .then((res) => {
      return Buffer.from(res.data);
    });
}

export const URL_CACHE_DIR = path.join(os.tmpdir(), 'waha-url-cache');
export const URL_CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

/**
 * fetchBuffer with a disk cache keyed by the exact URL, so sending the same
 * media URL to many chats downloads it once per TTL.
 * ponytail: no lock - concurrent misses on one URL each download, last rename wins.
 * ponytail: content behind a URL is assumed stable for the TTL.
 */
export async function fetchBufferCached(
  url: string,
  dir: string = URL_CACHE_DIR,
  fetch: (url: string) => Promise<Buffer> = fetchBuffer,
): Promise<Buffer> {
  const file = path.join(dir, createHash('sha256').update(url).digest('hex'));
  const stat = await fs.stat(file).catch(() => null);
  if (stat && Date.now() - stat.mtimeMs < URL_CACHE_TTL_MS) {
    return fs.readFile(file);
  }

  const buffer = await fetch(url);
  // A broken cache must never break sending
  try {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, buffer);
    await fs.rename(tmp, file);
  } catch {
    // ignore
  }
  pruneExpired(dir).catch(() => undefined);
  return buffer;
}

// ponytail: full dir scan on every miss, fine for hundreds of files
async function pruneExpired(dir: string): Promise<void> {
  const now = Date.now();
  for (const name of await fs.readdir(dir)) {
    const file = path.join(dir, name);
    const stat = await fs.stat(file).catch(() => null);
    if (stat && now - stat.mtimeMs >= URL_CACHE_TTL_MS) {
      await fs.unlink(file).catch(() => undefined);
    }
  }
}
