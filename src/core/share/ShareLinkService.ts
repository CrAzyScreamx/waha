import {
  GoneException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ShareLink } from '@waha/structures/share.dto';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const DEFAULT_TTL_HOURS = 24;

/**
 * Signed, self-contained pairing links - the token carries the session name and
 * the expiry, so handing one out stores nothing.
 */
@Injectable()
export class ShareLinkService {
  private readonly secret: string;

  // ponytail: closed links are kept in memory only, so a restart re-opens a
  // link whose session logged out again before its TTL ran out. Persist through
  // ISessionConfigRepository if that window ever matters.
  private readonly closed = new Set<string>();

  constructor() {
    const secret = process.env.WAHA_SHARE_SECRET || process.env.WAHA_API_KEY;
    this.secret = secret || randomBytes(32).toString('hex');
  }

  get ttlMs(): number {
    const hours = Number(process.env.WAHA_SHARE_LINK_TTL_HOURS);
    if (!Number.isFinite(hours) || hours <= 0) {
      return DEFAULT_TTL_HOURS * 3600_000;
    }
    return hours * 3600_000;
  }

  create(session: string): ShareLink {
    const expiresAt = Date.now() + this.ttlMs;
    const payload = JSON.stringify({ s: session, e: expiresAt });
    const body = Buffer.from(payload).toString('base64url');
    const token = `${body}.${this.digest(body)}`;
    return {
      token: token,
      path: `/share/${token}`,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  /**
   * Session the token was issued for. Throws when the link is not usable.
   */
  resolve(token: string): string {
    const [body, signature] = String(token).split('.');
    if (!body || !signature || !this.verify(body, signature)) {
      throw new UnauthorizedException('Invalid share link');
    }
    if (this.closed.has(token)) {
      throw new GoneException('This share link is closed');
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (Date.now() > payload.e) {
      throw new GoneException('This share link has expired');
    }
    return payload.s;
  }

  close(token: string) {
    this.closed.add(token);
  }

  private digest(body: string): string {
    return createHmac('sha256', this.secret)
      .update(body)
      .digest('base64url');
  }

  private verify(body: string, signature: string): boolean {
    const expected = Buffer.from(this.digest(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  }
}
