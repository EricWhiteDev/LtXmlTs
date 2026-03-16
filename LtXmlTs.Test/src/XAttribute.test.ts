import { describe, it, expect } from 'vitest';
import { XAttribute, XName } from 'ltxmlts';

describe('XAttribute', () => {
  it('sets nodeType to Attribute', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.nodeType).toBe('Attribute');
  });

  it('constructor with name only sets value to empty string', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.value).toBe('');
  });

  it('constructor with name only sets name', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.name).toBe(XName.get('id'));
  });

  it('constructor with string content sets value', () => {
    const a = new XAttribute(XName.get('id'), 'abc');
    expect(a.value).toBe('abc');
  });

  it('constructor with non-string content converts via toString', () => {
    const a = new XAttribute(XName.get('count'), 42);
    expect(a.value).toBe('42');
  });

  it('constructor with null content throws', () => {
    expect(() => new XAttribute(XName.get('id'), null)).toThrow();
  });

  it('constructor with undefined content throws', () => {
    expect(() => new XAttribute(XName.get('id'), undefined)).toThrow();
  });
});
