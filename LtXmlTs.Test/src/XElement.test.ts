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

  it('clone constructor copies name', () => {
    const e = new XElement(XName.get('root'));
    const clone = new XElement(e);
    expect(clone.name).toBe(XName.get('root'));
  });

  it('clone constructor produces a distinct object', () => {
    const e = new XElement(XName.get('root'));
    const clone = new XElement(e);
    expect(clone).not.toBe(e);
  });

  it('clone constructor copies attributes', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    const clone = new XElement(e);
    expect(clone.attributes()).toHaveLength(1);
    expect(clone.attributes()[0].value).toBe('1');
  });

  it('clone constructor does not share attribute objects', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    const clone = new XElement(e);
    expect(clone.attributes()[0]).not.toBe(e.attributes()[0]);
  });

  it('clone constructor sets parent of cloned attributes to new element', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    const clone = new XElement(e);
    expect(clone.attributes()[0].parent).toBe(clone);
  });

  it('clone constructor copies child nodes', () => {
    const e = new XElement(XName.get('root'), 'hello');
    const clone = new XElement(e);
    expect(clone.nodes()).toHaveLength(1);
  });

  it('clone constructor does not share node objects', () => {
    const e = new XElement(XName.get('root'), 'hello');
    const clone = new XElement(e);
    expect(clone.nodes()[0]).not.toBe(e.nodes()[0]);
  });

  it('clone constructor sets parent of cloned nodes to new element', () => {
    const e = new XElement(XName.get('root'), 'hello');
    const clone = new XElement(e);
    expect(clone.nodes()[0].parent).toBe(clone);
  });

  it('clone constructor recursively clones nested XElement', () => {
    const child = new XElement(XName.get('child'), 'text');
    const parent = new XElement(XName.get('root'), child);
    const clone = new XElement(parent);
    const clonedChild = clone.nodes()[0] as XElement;
    expect(clonedChild).not.toBe(child);
    expect(clonedChild.name).toBe(XName.get('child'));
    expect(clonedChild.nodes()[0]).not.toBe(child.nodes()[0]);
    expect(clonedChild.parent).toBe(clone);
  });

  it('clone constructor with empty element produces empty clone', () => {
    const e = new XElement(XName.get('root'));
    const clone = new XElement(e);
    expect(clone.attributes()).toHaveLength(0);
    expect(clone.nodes()).toHaveLength(0);
  });
});
