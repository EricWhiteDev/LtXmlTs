/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XElement, XName, XAttribute, XText, XComment, XDocument } from 'ltxmlts';

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

  // attribute
  it('attribute returns matching attribute by string name', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.attribute('id')).toBe(a);
  });

  it('attribute returns matching attribute by XName', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.attribute(XName.get('id'))).toBe(a);
  });

  it('attribute returns null when no match', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const e = new XElement(XName.get('root'), a);
    expect(e.attribute('missing')).toBeNull();
  });

  it('attribute returns null on element with no attributes', () => {
    const e = new XElement(XName.get('root'));
    expect(e.attribute('id')).toBeNull();
  });

  it('attribute returns correct attribute among multiple', () => {
    const a1 = new XAttribute(XName.get('a'), '1');
    const a2 = new XAttribute(XName.get('b'), '2');
    const e = new XElement(XName.get('root'), a1, a2);
    expect(e.attribute('a')).toBe(a1);
    expect(e.attribute('b')).toBe(a2);
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

describe('XElement.replaceNodes', () => {
  it('replaces existing content with a text node', () => {
    const e = new XElement('root', 'old');
    e.replaceNodes('new');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(1);
    expect((nodes[0] as XText).value).toBe('new');
  });

  it('clears all existing nodes when called with no arguments', () => {
    const e = new XElement('root', 'a', 'b');
    e.replaceNodes();
    expect(e.nodes()).toHaveLength(0);
  });

  it('replaces with multiple items in one call', () => {
    const e = new XElement('root', 'old');
    e.replaceNodes('x', 'y');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(2);
    expect((nodes[0] as XText).value).toBe('x');
    expect((nodes[1] as XText).value).toBe('y');
  });

  it('sets parent on new nodes', () => {
    const e = new XElement('root', 'old');
    const child = new XElement('child');
    e.replaceNodes(child);
    expect(child.parent).toBe(e);
  });

  it('nulls parent on removed nodes', () => {
    const child = new XElement('child');
    const e = new XElement('root', child);
    e.replaceNodes('replacement');
    expect(child.parent).toBeNull();
  });

  it('replaces content of an empty element', () => {
    const e = new XElement('root');
    e.replaceNodes('hello');
    expect(e.nodes()).toHaveLength(1);
    expect((e.nodes()[0] as XText).value).toBe('hello');
  });
});

describe('XElement.descendantNodes', () => {
  it('returns empty array for an element with no children', () => {
    const e = new XElement('root');
    expect(e.descendantNodes()).toHaveLength(0);
  });

  it('returns flat children in order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendantNodes();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it('returns nested descendants in depth-first pre-order', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    const result = e.descendantNodes();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(child);
    expect(result[1]).toBe(grandchild);
  });

  it('includes text and comment nodes', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root');
    e.add(t, c, child);
    const result = e.descendantNodes();
    expect(result).toHaveLength(3);
    expect(result[0]).toBeInstanceOf(XText);
    expect(result[1]).toBeInstanceOf(XComment);
    expect(result[2]).toBe(child);
  });

  it('returns correct document order for mixed nested content', () => {
    const inner = new XElement('inner');
    const child = new XElement('child', inner);
    const t = new XElement('sibling');
    const e = new XElement('root', child, t);
    const result = e.descendantNodes();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(child);
    expect(result[1]).toBe(inner);
    expect(result[2]).toBe(t);
  });
});

describe('XElement.descendantNodesAndSelf', () => {
  it('returns only the element itself for an empty element', () => {
    const e = new XElement('root');
    const result = e.descendantNodesAndSelf();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(e);
  });

  it('self is always first', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendantNodesAndSelf();
    expect(result[0]).toBe(e);
  });

  it('returns self followed by flat children in order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendantNodesAndSelf();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(e);
    expect(result[1]).toBe(a);
    expect(result[2]).toBe(b);
  });

  it('returns self followed by nested descendants in depth-first pre-order', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    const result = e.descendantNodesAndSelf();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(e);
    expect(result[1]).toBe(child);
    expect(result[2]).toBe(grandchild);
  });

  it('includes mixed node types (XText, XComment) alongside XElement children', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root');
    e.add(t, c, child);
    const result = e.descendantNodesAndSelf();
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(e);
    expect(result[1]).toBeInstanceOf(XText);
    expect(result[2]).toBeInstanceOf(XComment);
    expect(result[3]).toBe(child);
  });
});

describe('XElement.descendantsAndSelf', () => {
  it('returns only the element itself for an empty element', () => {
    const e = new XElement('root');
    const result = e.descendantsAndSelf();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(e);
  });

  it('returns self followed by flat children in document order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendantsAndSelf();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(e);
    expect(result[1]).toBe(a);
    expect(result[2]).toBe(b);
  });

  it('returns self followed by nested descendants in depth-first pre-order', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    const result = e.descendantsAndSelf();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(e);
    expect(result[1]).toBe(child);
    expect(result[2]).toBe(grandchild);
  });

  it('excludes non-element nodes (XText, XComment)', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root');
    e.add(t, c, child);
    const result = e.descendantsAndSelf();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(e);
    expect(result[1]).toBe(child);
  });

  it('filters by XName — returns self and matching descendants only', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const a2 = new XElement('a');
    const e = new XElement('root', a, b, a2);
    const result = e.descendantsAndSelf(new XName('a'));
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(a2);
  });

  it('filters by string name — same result as XName overload', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendantsAndSelf('a');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(a);
  });

  it('returns empty array when filter matches nothing (including self)', () => {
    const a = new XElement('a');
    const e = new XElement('root', a);
    const result = e.descendantsAndSelf('nomatch');
    expect(result).toHaveLength(0);
  });

  it('self is always first when unfiltered', () => {
    const child = new XElement('child');
    const e = new XElement('root', child);
    const result = e.descendantsAndSelf();
    expect(result[0]).toBe(e);
  });
});

describe('XElement.descendants', () => {
  it('returns empty array for an element with no children', () => {
    const e = new XElement('root');
    expect(e.descendants()).toHaveLength(0);
  });

  it('returns flat child elements in order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.descendants();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it('returns nested descendants in depth-first pre-order', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    const result = e.descendants();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(child);
    expect(result[1]).toBe(grandchild);
  });

  it('skips non-element nodes', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root');
    e.add(t, c, child);
    const result = e.descendants();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(child);
  });

  it('filters by XName', () => {
    const a1 = new XElement('a');
    const a2 = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a1, b, a2);
    const result = e.descendants(XName.get('a'));
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a1);
    expect(result[1]).toBe(a2);
  });

  it('filters by string name', () => {
    const match = new XElement('target');
    const other = new XElement('other', match);
    const e = new XElement('root', other);
    const result = e.descendants('target');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(match);
  });

  it('returns empty array when no elements match the filter', () => {
    const e = new XElement('root', new XElement('a'), new XElement('b'));
    expect(e.descendants('z')).toHaveLength(0);
  });

  it('returns correct document order for deeply mixed content', () => {
    const inner = new XElement('inner');
    const child = new XElement('child', inner);
    const sibling = new XElement('sibling');
    const e = new XElement('root', child, sibling);
    const result = e.descendants();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(child);
    expect(result[1]).toBe(inner);
    expect(result[2]).toBe(sibling);
  });
});

describe('XElement.elements', () => {
  it('returns empty array for an element with no children', () => {
    const e = new XElement('root');
    expect(e.elements()).toHaveLength(0);
  });

  it('returns direct child elements in document order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.elements();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it('skips non-element nodes', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root', t, c, child);
    const result = e.elements();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(child);
  });

  it('does not include grandchildren', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    const result = e.elements();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(child);
  });

  it('filters by XName', () => {
    const a1 = new XElement('a');
    const a2 = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a1, b, a2);
    const result = e.elements(XName.get('a'));
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a1);
    expect(result[1]).toBe(a2);
  });

  it('filters by string name', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    const result = e.elements('a');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(a);
  });

  it('returns empty array when no elements match the filter', () => {
    const e = new XElement('root', new XElement('a'), new XElement('b'));
    expect(e.elements('z')).toHaveLength(0);
  });
});

describe('XElement.element', () => {
  it('returns null when the element has no children', () => {
    const e = new XElement('root');
    expect(e.element('child')).toBeNull();
  });

  it('returns null when no child element matches the name', () => {
    const e = new XElement('root', new XElement('a'), new XElement('b'));
    expect(e.element('z')).toBeNull();
  });

  it('returns the first matching child element', () => {
    const a1 = new XElement('a');
    const a2 = new XElement('a');
    const e = new XElement('root', a1, a2);
    expect(e.element('a')).toBe(a1);
  });

  it('skips non-element nodes', () => {
    const t = new XText('hello');
    const c = new XComment('note');
    const child = new XElement('child');
    const e = new XElement('root', t, c, child);
    expect(e.element('child')).toBe(child);
  });

  it('does not search grandchildren', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const e = new XElement('root', child);
    expect(e.element('gc')).toBeNull();
  });

  it('accepts an XName argument', () => {
    const child = new XElement('child');
    const e = new XElement('root', child);
    expect(e.element(XName.get('child'))).toBe(child);
  });

  it('accepts a string argument', () => {
    const child = new XElement('child');
    const e = new XElement('root', child);
    expect(e.element('child')).toBe(child);
  });
});

describe('XElement.removeNodes', () => {
  it('removes all child nodes from an element', () => {
    const e = new XElement('root', new XElement('a'), new XElement('b'));
    e.removeNodes();
    expect(e.nodes()).toHaveLength(0);
  });

  it('nulls the parent of each removed node', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    e.removeNodes();
    expect(a.parent).toBeNull();
    expect(b.parent).toBeNull();
  });

  it('is a no-op on an element with no children', () => {
    const e = new XElement('root');
    e.removeNodes();
    expect(e.nodes()).toHaveLength(0);
  });

  it('removes mixed-type child nodes', () => {
    const e = new XElement('root', new XText('hi'), new XComment('note'), new XElement('child'));
    e.removeNodes();
    expect(e.nodes()).toHaveLength(0);
  });
});

describe('XElement.firstNode', () => {
  it('returns null when element has no children', () => {
    const e = new XElement('root');
    expect(e.firstNode).toBeNull();
  });

  it('returns the only child node', () => {
    const child = new XElement('a');
    const e = new XElement('root', child);
    expect(e.firstNode).toBe(child);
  });

  it('returns the first of multiple children', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    expect(e.firstNode).toBe(a);
    expect(e.firstNode).not.toBe(b);
  });

  it('returns a text node when it is first', () => {
    const t = new XText('hello');
    const e = new XElement('root', t, new XElement('child'));
    expect(e.firstNode).toBe(t);
  });
});

describe('XElement.lastNode', () => {
  it('returns null when element has no children', () => {
    const e = new XElement('root');
    expect(e.lastNode).toBeNull();
  });

  it('returns the only child node', () => {
    const child = new XElement('a');
    const e = new XElement('root', child);
    expect(e.lastNode).toBe(child);
  });

  it('returns the last of multiple children', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const e = new XElement('root', a, b);
    expect(e.lastNode).toBe(b);
    expect(e.lastNode).not.toBe(a);
  });

  it('returns a text node when it is last', () => {
    const t = new XText('world');
    const e = new XElement('root', new XElement('child'), t);
    expect(e.lastNode).toBe(t);
  });
});

describe('XElement.ancestorsAndSelf', () => {
  describe('no-arg overload', () => {
    it('returns [self] when element has no parent', () => {
      const el = new XElement('root');
      expect(el.ancestorsAndSelf()).toEqual([el]);
    });

    it('returns [self] when immediate parent is XDocument', () => {
      const root = new XElement('root');
      const doc = new XDocument(root);
      const el = doc.nodes()[0] as XElement;
      expect(el.ancestorsAndSelf()).toEqual([el]);
    });

    it('returns [self, parent] for one level deep', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf()).toEqual([child, parent]);
    });

    it('returns [self, parent, grandparent] for two levels deep', () => {
      const grandparent = new XElement('grandparent', new XElement('parent', new XElement('child')));
      const parent = grandparent.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf()).toEqual([child, parent, grandparent]);
    });

    it('stops at XDocument and does not include it', () => {
      const child = new XElement('child');
      const root = new XElement('root', child);
      new XDocument(root);
      expect(child.ancestorsAndSelf()).toEqual([child, root]);
    });
  });

  describe('named overload (XName arg)', () => {
    it('returns [self] when self matches and parent does not', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf(new XName('child'))).toEqual([child]);
    });

    it('returns [parent] when parent matches and self does not', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf(new XName('parent'))).toEqual([parent]);
    });

    it('returns [] when no element in chain matches', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf(new XName('other'))).toEqual([]);
    });

    it('returns [self, grandparent] when both match but parent does not', () => {
      const grandparent = new XElement('foo', new XElement('bar', new XElement('foo')));
      const parent = grandparent.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf(new XName('foo'))).toEqual([child, grandparent]);
    });

    it('returns all matching elements in self-to-outer order', () => {
      const grandparent = new XElement('foo', new XElement('foo', new XElement('foo')));
      const parent = grandparent.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf(new XName('foo'))).toEqual([child, parent, grandparent]);
    });
  });

  describe('named overload (string arg)', () => {
    it('matches self by string name', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf('child')).toEqual([child]);
    });

    it('matches ancestor by string name', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf('parent')).toEqual([parent]);
    });

    it('returns [] when string name matches nothing', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestorsAndSelf('other')).toEqual([]);
    });
  });
});

describe('XElement.removeAttribute', () => {
  it('removes the attribute from the element', () => {
    const attr = new XAttribute('id', '42');
    const el = new XElement('root', attr);
    el.removeAttribute(attr);
    expect([...el.attributes()]).not.toContain(attr);
  });

  it('nulls the parent of the removed attribute', () => {
    const attr = new XAttribute('id', '42');
    const el = new XElement('root', attr);
    el.removeAttribute(attr);
    expect(attr.parent).toBeNull();
  });

  it('leaves sibling attributes intact', () => {
    const a1 = new XAttribute('id', '1');
    const a2 = new XAttribute('class', 'foo');
    const el = new XElement('root', a1, a2);
    el.removeAttribute(a1);
    expect([...el.attributes()]).toEqual([a2]);
  });
});

describe('XElement.removeAttributes', () => {
  it('no-op on element with no attributes', () => {
    const el = new XElement('root');
    expect(() => el.removeAttributes()).not.toThrow();
  });

  it('clears all attributes', () => {
    const el = new XElement('root', new XAttribute('id', '1'), new XAttribute('class', 'foo'));
    el.removeAttributes();
    expect([...el.attributes()]).toHaveLength(0);
  });

  it('nulls parent of each removed attribute', () => {
    const a1 = new XAttribute('id', '1');
    const a2 = new XAttribute('class', 'foo');
    const el = new XElement('root', a1, a2);
    el.removeAttributes();
    expect(a1.parent).toBeNull();
    expect(a2.parent).toBeNull();
  });

  it('leaves child nodes intact', () => {
    const child = new XElement('child');
    const el = new XElement('root', new XAttribute('id', '1'), child);
    el.removeAttributes();
    expect([...el.nodes()]).toHaveLength(1);
    expect([...el.nodes()][0]).toBe(child);
  });

  it('returns void', () => {
    const el = new XElement('root', new XAttribute('id', '1'));
    expect(el.removeAttributes()).toBeUndefined();
  });
});

describe('XElement.attributes(name)', () => {
  it('returns matching attribute by string name', () => {
    const a = new XAttribute('id', '1');
    const e = new XElement('root', a, new XAttribute('class', 'foo'));
    const result = e.attributes('id');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(a);
  });

  it('returns matching attribute by XName', () => {
    const a = new XAttribute('id', '1');
    const e = new XElement('root', a, new XAttribute('class', 'foo'));
    const result = e.attributes(XName.get('id'));
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('1');
  });

  it('returns empty array when name does not match', () => {
    const e = new XElement('root', new XAttribute('id', '1'));
    expect(e.attributes('missing')).toHaveLength(0);
  });

  it('returns empty array on element with no attributes', () => {
    const e = new XElement('root');
    expect(e.attributes('id')).toHaveLength(0);
  });

  it('no-arg form still returns all attributes', () => {
    const a1 = new XAttribute('id', '1');
    const a2 = new XAttribute('class', 'foo');
    const e = new XElement('root', a1, a2);
    expect(e.attributes()).toHaveLength(2);
  });
});

describe('XElement.removeAll', () => {
  it('succeeds on empty element with no nodes or attributes', () => {
    const e = new XElement('root');
    expect(() => e.removeAll()).not.toThrow();
  });

  it('clears all child nodes', () => {
    const e = new XElement('root', new XElement('a'), new XElement('b'));
    e.removeAll();
    expect(e.nodes()).toHaveLength(0);
  });

  it('nulls parent of removed nodes', () => {
    const child1 = new XElement('a');
    const child2 = new XElement('b');
    const e = new XElement('root', child1, child2);
    e.removeAll();
    expect(child1.parent).toBeNull();
    expect(child2.parent).toBeNull();
  });

  it('clears all attributes', () => {
    const e = new XElement('root', new XAttribute('id', '1'), new XAttribute('class', 'foo'));
    e.removeAll();
    expect(e.attributes()).toHaveLength(0);
  });

  it('nulls parent of removed attributes', () => {
    const a1 = new XAttribute('id', '1');
    const a2 = new XAttribute('class', 'foo');
    const e = new XElement('root', a1, a2);
    e.removeAll();
    expect(a1.parent).toBeNull();
    expect(a2.parent).toBeNull();
  });

  it('clears both nodes and attributes together', () => {
    const child = new XElement('child');
    const attr = new XAttribute('id', '1');
    const e = new XElement('root', attr, child);
    e.removeAll();
    expect(e.nodes()).toHaveLength(0);
    expect(e.attributes()).toHaveLength(0);
  });

  it('returns void', () => {
    const e = new XElement('root', new XAttribute('id', '1'), new XElement('child'));
    expect(e.removeAll()).toBeUndefined();
  });
});
