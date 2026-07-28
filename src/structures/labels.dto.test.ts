import { ValidationPipe } from '@nestjs/common';
import { SetLabelsRequest } from '@waha/structures/labels.dto';

describe('SetLabelsRequest', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const transform = (body: any) =>
    pipe.transform(body, { type: 'body', metatype: SetLabelsRequest });

  it('keeps label ids - whitelist must not strip them', async () => {
    const result = await transform({ labels: [{ id: '4' }] });
    expect(result.labels.map((label) => label.id)).toEqual(['4']);
  });

  it('accepts an empty array to clear labels', async () => {
    const result = await transform({ labels: [] });
    expect(result.labels).toEqual([]);
  });

  it('rejects a missing labels array', async () => {
    await expect(transform({})).rejects.toThrow();
  });
});
