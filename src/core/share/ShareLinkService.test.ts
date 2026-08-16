import { ShareLinkService } from '@waha/core/share/ShareLinkService';
import {
  SHARE_INJECT_JS,
  SHARE_PAGE_HTML,
} from '@waha/core/share/share.assets';

describe('ShareLinkService', () => {
  const service = new ShareLinkService();

  it('resolves the session a link was issued for', () => {
    const link = service.create('Nadav');
    expect(service.resolve(link.token)).toEqual('Nadav');
    expect(link.path).toEqual(`/share/${link.token}`);
  });

  it('rejects a tampered token', () => {
    const link = service.create('Nadav');
    const [body] = link.token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ s: 'Bot1', e: Date.now() + 1000 }),
    ).toString('base64url');
    expect(() => service.resolve(link.token.replace(body, forged))).toThrow();
    expect(() => service.resolve(`${body}.nope`)).toThrow();
    expect(() => service.resolve('garbage')).toThrow();
  });

  it('rejects an expired token', () => {
    process.env.WAHA_SHARE_LINK_TTL_HOURS = '-1';
    const expired = new ShareLinkService().create('Nadav');
    delete process.env.WAHA_SHARE_LINK_TTL_HOURS;
    expect(() => service.resolve(expired.token)).toThrow();
  });

  it('rejects a closed token', () => {
    const link = service.create('Nadav');
    service.close(link.token);
    expect(() => service.resolve(link.token)).toThrow();
  });

  it('does not accept links signed with another secret', () => {
    process.env.WAHA_SHARE_SECRET = 'other-secret';
    const other = new ShareLinkService().create('Nadav');
    delete process.env.WAHA_SHARE_SECRET;
    expect(() => service.resolve(other.token)).toThrow();
  });
});

describe('share assets', () => {
  const script = SHARE_PAGE_HTML.split('<script>')[1].split('</script>')[0];

  it('ships syntactically valid browser scripts', () => {
    expect(() => new Function(script)).not.toThrow();
    expect(() => new Function(SHARE_INJECT_JS)).not.toThrow();
  });

  it('keeps the page and the widget pointing at the same routes', () => {
    expect(script).toContain("'/share/'");
    expect(SHARE_INJECT_JS).toContain('/share-link');
  });
});
