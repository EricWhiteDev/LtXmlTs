import { describe, it, expect } from 'vitest';
import { XElement, XName } from 'ltxmlts';

describe('XElement', () => {
  it('sets nodeType to Element', () => {
    const e = new XElement(XName.get('root'));
    expect(e.nodeType).toBe('Element');
  });

  it('constructor with name sets name', () => {
    const e = new XElement(XName.get('root'));
    expect(e.name).toBe(XName.get('root'));
  });
});
