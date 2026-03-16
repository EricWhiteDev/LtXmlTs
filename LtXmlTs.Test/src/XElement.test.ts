import { describe, it, expect } from 'vitest';
import { XElement, XName, XAttribute } from 'ltxmlts';

describe('XElement', () => {
  it('sets nodeType to Element', () => {
    const e = new XElement(XName.get('root'));
    expect(e.nodeType).toBe('Element');
  });

  it('constructor with name sets name', () => {
    const e = new XElement(XName.get('root'));
    expect(e.name).toBe(XName.get('root'));
  });

  it('constructor with string content adds XText node', () => {
    const e = new XElement(XName.get('root'), 'hello');
    expect(e.nodes()).toHaveLength(1);
  });

  it('constructor with no content produces empty nodes', () => {
    const e = new XElement(XName.get('root'));
    expect(e.nodes()).toHaveLength(0);
  });

  it('constructor with XAttribute populates attributes()', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.attributes()).toHaveLength(1);
    expect(e.attributes()[0]).toBe(a);
  });

  it('constructor with XAttribute sets attribute parent', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(a.parent).toBe(e);
  });

  it('constructor with XAttribute does not add it to nodes()', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.nodes()).toHaveLength(0);
  });

  it('constructor with already-parented XAttribute clones it', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e1 = new XElement(XName.get('root'), a);
    const e2 = new XElement(XName.get('root'), a);
    expect(e2.attributes()[0]).not.toBe(a);
    expect(e2.attributes()[0].value).toBe('1');
    expect(e2.attributes()[0].parent).toBe(e2);
  });

  it('constructor with null ignores attributes', () => {
    const e = new XElement(XName.get('root'), null);
    expect(e.attributes()).toHaveLength(0);
  });

  it('constructor with mixed content: attributes and nodes are separated', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a, 'hello');
    expect(e.attributes()).toHaveLength(1);
    expect(e.nodes()).toHaveLength(1);
  });

  it('constructor preserves attribute order', () => {
    const a1 = new XAttribute(XName.get('a'), '1');
    const a2 = new XAttribute(XName.get('b'), '2');
    const e = new XElement(XName.get('root'), a1, a2);
    const attrs = e.attributes();
    expect(attrs[0].name).toBe(XName.get('a'));
    expect(attrs[1].name).toBe(XName.get('b'));
  });
});
