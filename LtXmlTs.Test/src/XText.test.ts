import { describe, it, expect } from 'vitest';
import { XText } from 'ltxmlts';

describe('XText', () => {
  it('constructs from a string and sets value', () => {
    const t = new XText('hello');
    expect(t.value).toBe('hello');
  });

  it('sets nodeType to Text', () => {
    const t = new XText('hello');
    expect(t.nodeType).toBe('Text');
  });

  it('copy constructor copies value from other XText', () => {
    const original = new XText('original text');
    const copy = new XText(original);
    expect(copy.value).toBe('original text');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XText('original text');
    const copy = new XText(original);
    expect(copy).not.toBe(original);
  });
});

describe('XText.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XText('hello').equals(new XText('hello'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XText('hello').equals(new XText('world'))).toBe(false);
  });
  it('returns true for two empty-string text nodes', () => {
    expect(new XText('').equals(new XText(''))).toBe(true);
  });
});
