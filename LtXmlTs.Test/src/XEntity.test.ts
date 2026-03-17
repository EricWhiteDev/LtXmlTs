import { describe, it, expect } from 'vitest';
import { XEntity } from 'ltxmlts';

describe('XEntity', () => {
  it('constructs from a string and sets value', () => {
    const e = new XEntity('amp');
    expect(e.value).toBe('amp');
  });

  it('sets nodeType to Entity', () => {
    const e = new XEntity('amp');
    expect(e.nodeType).toBe('Entity');
  });

  it('copy constructor copies value from other XEntity', () => {
    const original = new XEntity('original entity');
    const copy = new XEntity(original);
    expect(copy.value).toBe('original entity');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XEntity('original entity');
    const copy = new XEntity(original);
    expect(copy).not.toBe(original);
  });
});

describe('XEntity.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XEntity('amp').equals(new XEntity('amp'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XEntity('amp').equals(new XEntity('lt'))).toBe(false);
  });
  it('returns true for two empty-string entities', () => {
    expect(new XEntity('').equals(new XEntity(''))).toBe(true);
  });
});
