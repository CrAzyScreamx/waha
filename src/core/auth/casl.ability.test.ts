import { CaslAbilityFactory } from './casl.ability';
import { Action, session } from './casl.types';

describe('CaslAbilityFactory - key shared across sessions', () => {
  const ability = new CaslAbilityFactory().createForUser({
    isAdmin: false,
    session: 'a',
    actions: { read: true, send: true },
    scopes: [
      { session: 'a', actions: { read: true, send: true } },
      { session: 'b', actions: { read: true } },
    ],
  });

  it('grants each session its own actions', () => {
    expect(ability.can(Action.Send, new session('a'))).toBe(true);
    expect(ability.can(Action.Read, new session('b'))).toBe(true);
    expect(ability.can(Action.Send, new session('b'))).toBe(false);
  });

  it('denies sessions outside the key', () => {
    expect(ability.can(Action.Read, new session('c'))).toBe(false);
    expect(ability.can(Action.Retrieve, new session('c'))).toBe(false);
  });
});
