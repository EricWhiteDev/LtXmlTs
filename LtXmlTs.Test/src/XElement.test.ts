/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XElement, XName, XAttribute, XText, XComment } from 'ltxmlts';

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

  it('string constructor sets name via clark notation (plain)', () => {
    const e = new XElement('root');
    expect(e.name).toBe(XName.get('root'));
  });

  it('string constructor sets name via clark notation (namespaced)', () => {
    const e = new XElement('{http://example.com}root');
    expect(e.name).toBe(XName.get('{http://example.com}root'));
  });

  it('string constructor with content adds nodes', () => {
    const e = new XElement('root', 'hello');
    expect(e.name).toBe(XName.get('root'));
    expect(e.nodes()).toHaveLength(1);
  });

  it('string constructor with namespaced name and content adds nodes', () => {
    const e = new XElement('{http://example.com}root', 'hello');
    expect(e.name).toBe(XName.get('{http://example.com}root'));
    expect(e.nodes()).toHaveLength(1);
  });

  // firstAttribute
  it('firstAttribute returns null when no attributes', () => {
    const e = new XElement(XName.get('root'));
    expect(e.firstAttribute).toBeNull();
  });

  it('firstAttribute returns the attribute when one exists', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.firstAttribute).toBe(a);
  });

  it('firstAttribute returns the first attribute when multiple exist', () => {
    const a1 = new XAttribute(XName.get('a'), '1');
    const a2 = new XAttribute(XName.get('b'), '2');
    const e = new XElement(XName.get('root'), a1, a2);
    expect(e.firstAttribute).toBe(a1);
    expect(e.firstAttribute).not.toBe(a2);
  });

  // lastAttribute
  it('lastAttribute returns null when no attributes', () => {
    const e = new XElement(XName.get('root'));
    expect(e.lastAttribute).toBeNull();
  });

  it('lastAttribute returns the attribute when one exists', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.lastAttribute).toBe(a);
  });

  it('lastAttribute returns the last attribute when multiple exist', () => {
    const a1 = new XAttribute(XName.get('a'), '1');
    const a2 = new XAttribute(XName.get('b'), '2');
    const e = new XElement(XName.get('root'), a1, a2);
    expect(e.lastAttribute).toBe(a2);
    expect(e.lastAttribute).not.toBe(a1);
  });

  // hasAttributes
  it('hasAttributes returns false when no attributes', () => {
    const e = new XElement(XName.get('root'));
    expect(e.hasAttributes).toBe(false);
  });

  it('hasAttributes returns true when one attribute exists', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.hasAttributes).toBe(true);
  });

  it('hasAttributes returns true when multiple attributes exist', () => {
    const a1 = new XAttribute(XName.get('a'), '1');
    const a2 = new XAttribute(XName.get('b'), '2');
    const e = new XElement(XName.get('root'), a1, a2);
    expect(e.hasAttributes).toBe(true);
  });

  // hasElements
  it('hasElements returns false when nodesArray is empty', () => {
    const e = new XElement(XName.get('root'));
    expect(e.hasElements).toBe(false);
  });

  it('hasElements returns false when nodesArray contains only text nodes', () => {
    const e = new XElement(XName.get('root'), 'hello');
    expect(e.hasElements).toBe(false);
  });

  it('hasElements returns true when nodesArray contains an XElement child', () => {
    const child = new XElement(XName.get('child'));
    const e = new XElement(XName.get('root'), child);
    expect(e.hasElements).toBe(true);
  });

  it('hasElements returns true when XElement is mixed with text nodes', () => {
    const child = new XElement(XName.get('child'));
    const e = new XElement(XName.get('root'), 'text', child);
    expect(e.hasElements).toBe(true);
  });

  // isEmpty
  it('isEmpty returns true when nodesArray is empty', () => {
    const e = new XElement(XName.get('root'));
    expect(e.isEmpty).toBe(true);
  });

  it('isEmpty returns false when nodesArray has content', () => {
    const e = new XElement(XName.get('root'), 'hello');
    expect(e.isEmpty).toBe(false);
  });

  it('isEmpty returns true when element has attributes but no child nodes', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.isEmpty).toBe(true);
  });
});

describe('XElement.equals', () => {
  it('returns true for two elements with same name and no children', () => {
    expect(new XElement('foo').equals(new XElement('foo'))).toBe(true);
  });
  it('returns false when names differ', () => {
    expect(new XElement('foo').equals(new XElement('bar'))).toBe(false);
  });
  it('returns false when attribute counts differ', () => {
    const a = new XElement('foo', new XAttribute('id', '1'));
    const b = new XElement('foo');
    expect(a.equals(b)).toBe(false);
  });
  it('returns false when attribute values differ', () => {
    const a = new XElement('foo', new XAttribute('id', '1'));
    const b = new XElement('foo', new XAttribute('id', '2'));
    expect(a.equals(b)).toBe(false);
  });
  it('returns true when names, attributes, and children are all equal', () => {
    const a = new XElement('foo', new XAttribute('id', '1'), new XText('hello'));
    const b = new XElement('foo', new XAttribute('id', '1'), new XText('hello'));
    expect(a.equals(b)).toBe(true);
  });
  it('returns true for nested equal elements', () => {
    const a = new XElement('root', new XElement('child', new XText('x')));
    const b = new XElement('root', new XElement('child', new XText('x')));
    expect(a.equals(b)).toBe(true);
  });
  it('returns false for nested elements that differ', () => {
    const a = new XElement('root', new XElement('child', new XText('x')));
    const b = new XElement('root', new XElement('child', new XText('y')));
    expect(a.equals(b)).toBe(false);
  });
});

describe('XElement.add', () => {
  it('appends a text node to an empty element', () => {
    const e = new XElement('root');
    e.add('hello');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(1);
    expect((nodes[0] as XText).value).toBe('hello');
  });

  it('appends to existing content', () => {
    const e = new XElement('root', 'first');
    e.add('second');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(2);
    expect((nodes[0] as XText).value).toBe('first');
    expect((nodes[1] as XText).value).toBe('second');
  });

  it('appends multiple items in one call', () => {
    const e = new XElement('root');
    e.add('a', 'b', 'c');
    expect(e.nodes()).toHaveLength(3);
  });

  it('appends a child element', () => {
    const parent = new XElement('root');
    const child = new XElement('child');
    parent.add(child);
    expect(parent.nodes()[0]).toBe(child);
    expect(child.parent).toBe(parent);
  });

  it('ignores null and undefined', () => {
    const e = new XElement('root');
    e.add(null, undefined);
    expect(e.nodes()).toHaveLength(0);
  });

  it('appends a comment node', () => {
    const e = new XElement('root');
    const c = new XComment('note');
    e.add(c);
    expect(e.nodes()[0]).toBe(c);
  });
});

describe('XElement.addFirst', () => {
  it('prepends a text node to an empty element', () => {
    const e = new XElement('root');
    e.addFirst('hello');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(1);
    expect((nodes[0] as XText).value).toBe('hello');
  });

  it('prepends before existing content', () => {
    const e = new XElement('root', 'second');
    e.addFirst('first');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(2);
    expect((nodes[0] as XText).value).toBe('first');
    expect((nodes[1] as XText).value).toBe('second');
  });

  it('prepends multiple items in one call', () => {
    const e = new XElement('root', 'c');
    e.addFirst('a', 'b');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(3);
    expect((nodes[0] as XText).value).toBe('a');
    expect((nodes[1] as XText).value).toBe('b');
    expect((nodes[2] as XText).value).toBe('c');
  });

  it('prepends a child element', () => {
    const parent = new XElement('root', new XElement('second'));
    const first = new XElement('first');
    parent.addFirst(first);
    expect(parent.nodes()[0]).toBe(first);
    expect(first.parent).toBe(parent);
  });

  it('ignores null and undefined', () => {
    const e = new XElement('root', 'x');
    e.addFirst(null, undefined);
    expect(e.nodes()).toHaveLength(1);
  });

  it('prepends a comment node', () => {
    const e = new XElement('root', 'text');
    const c = new XComment('note');
    e.addFirst(c);
    expect(e.nodes()[0]).toBe(c);
  });
});
