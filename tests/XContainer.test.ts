/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import {
  XElement, XName, XComment, XText, XCData,
  XProcessingInstruction, XAttribute
} from 'ltxmlts';

const name = () => XName.get('root');

describe('XContainer.addContentObject', () => {
  it('ignores null', () => {
    const e = new XElement(name(), null);
    expect(e.nodes()).toHaveLength(0);
  });

  it('ignores undefined', () => {
    const e = new XElement(name(), undefined);
    expect(e.nodes()).toHaveLength(0);
  });

  it('ignores XAttribute', () => {
    const e = new XElement(name(), new XAttribute(XName.get('id'), '1'));
    expect(e.nodes()).toHaveLength(0);
  });

  it('adds string as XText', () => {
    const e = new XElement(name(), 'hello');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toBeInstanceOf(XText);
    expect((nodes[0] as XText).value).toBe('hello');
  });

  it('sets parent on string-derived XText', () => {
    const e = new XElement(name(), 'hello');
    expect(e.nodes()[0].parent).toBe(e);
  });

  it('adds XComment with no parent', () => {
    const c = new XComment('note');
    const e = new XElement(name(), c);
    expect(e.nodes()[0]).toBe(c);
    expect(c.parent).toBe(e);
  });

  it('clones XComment that already has a parent', () => {
    const c = new XComment('note');
    const e1 = new XElement(name(), c);
    const e2 = new XElement(name(), c);
    const nodes1 = e1.nodes();
    const nodes2 = e2.nodes();
    expect(nodes1[0]).toBe(c);
    expect(nodes2[0]).not.toBe(c);
    expect((nodes2[0] as XComment).value).toBe('note');
    expect(nodes2[0].parent).toBe(e2);
  });

  it('adds XText with no parent', () => {
    const t = new XText('text');
    const e = new XElement(name(), t);
    expect(e.nodes()[0]).toBe(t);
    expect(t.parent).toBe(e);
  });

  it('clones XText that already has a parent', () => {
    const t = new XText('text');
    const e1 = new XElement(name(), t);
    const e2 = new XElement(name(), t);
    expect(e2.nodes()[0]).not.toBe(t);
    expect((e2.nodes()[0] as XText).value).toBe('text');
  });

  it('adds XCData with no parent', () => {
    const cd = new XCData('<b>bold</b>');
    const e = new XElement(name(), cd);
    expect(e.nodes()[0]).toBe(cd);
    expect(cd.parent).toBe(e);
  });

  it('clones XCData that already has a parent', () => {
    const cd = new XCData('<b>bold</b>');
    const e1 = new XElement(name(), cd);
    const e2 = new XElement(name(), cd);
    expect(e2.nodes()[0]).not.toBe(cd);
    expect((e2.nodes()[0] as XCData).value).toBe('<b>bold</b>');
  });

  it('adds XProcessingInstruction with no parent', () => {
    const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    const e = new XElement(name(), pi);
    expect(e.nodes()[0]).toBe(pi);
    expect(pi.parent).toBe(e);
  });

  it('clones XProcessingInstruction that already has a parent', () => {
    const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    const e1 = new XElement(name(), pi);
    const e2 = new XElement(name(), pi);
    expect(e2.nodes()[0]).not.toBe(pi);
    expect((e2.nodes()[0] as XProcessingInstruction).target).toBe('xml-stylesheet');
  });

  it('adds XElement child with no parent', () => {
    const child = new XElement(XName.get('child'));
    const parent = new XElement(name(), child);
    expect(parent.nodes()[0]).toBe(child);
    expect(child.parent).toBe(parent);
  });

  it('clones XElement that already has a parent', () => {
    const child = new XElement(XName.get('child'));
    const e1 = new XElement(name(), child);
    const e2 = new XElement(name(), child);
    // child should remain with e1; e2 gets a clone
    expect(e1.nodes()[0]).toBe(child);
    expect(child.parent).toBe(e1);
    const cloned = e2.nodes()[0] as XElement;
    expect(cloned).not.toBe(child);
    expect(cloned.name).toBe(child.name);
    expect(cloned.parent).toBe(e2);
  });

  it('recurses into arrays', () => {
    const e = new XElement(name(), ['a', 'b', 'c']);
    const nodes = e.nodes();
    expect(nodes).toHaveLength(3);
    expect((nodes[0] as XText).value).toBe('a');
    expect((nodes[2] as XText).value).toBe('c');
  });

  it('recurses into nested arrays', () => {
    const e = new XElement(name(), [['x'], 'y']);
    expect(e.nodes()).toHaveLength(2);
  });

  it('calls toString() on objects with custom toString', () => {
    const obj = { toString: () => 'custom' };
    const e = new XElement(name(), obj);
    const nodes = e.nodes();
    expect(nodes).toHaveLength(1);
    expect((nodes[0] as XText).value).toBe('custom');
  });

  it('ignores objects whose toString() returns [object Object]', () => {
    const e = new XElement(name(), {});
    expect(e.nodes()).toHaveLength(0);
  });

  it('preserves order of multiple content args', () => {
    const e = new XElement(name(), 'a', new XComment('b'), 'c');
    const nodes = e.nodes();
    expect(nodes).toHaveLength(3);
    expect((nodes[0] as XText).value).toBe('a');
    expect((nodes[1] as XComment).value).toBe('b');
    expect((nodes[2] as XText).value).toBe('c');
  });
});

describe('XContainer.addContentObject — XElement clone-on-reparent (Bug 1)', () => {
  it('clones XElement with children when already parented', () => {
    const child = new XElement('child', new XElement('grandchild'));
    const e1 = new XElement('parent1', child);
    const e2 = new XElement('parent2', child);
    const cloned = e2.nodes()[0] as XElement;
    expect(cloned).not.toBe(child);
    expect(cloned.name).toBe(child.name);
    expect(cloned.elements()).toHaveLength(1);
    expect(cloned.elements()[0].name.localName).toBe('grandchild');
  });

  it('clones XElement with attributes when already parented', () => {
    const child = new XElement('child', new XAttribute('id', '1'));
    const e1 = new XElement('parent1', child);
    const e2 = new XElement('parent2', child);
    const cloned = e2.nodes()[0] as XElement;
    expect(cloned).not.toBe(child);
    expect(cloned.attribute('id')!.value).toBe('1');
  });

  it('does not corrupt original parent when cloning', () => {
    const child = new XElement('child', 'text');
    const e1 = new XElement('parent1', child);
    const e2 = new XElement('parent2', child);
    // e1 should still have the original child
    expect(e1.nodes()[0]).toBe(child);
    expect(child.parent).toBe(e1);
    expect(e1.elements()[0].value).toBe('text');
  });

  it('clones XElement added via add() when already parented', () => {
    const child = new XElement('child');
    const e1 = new XElement('parent1', child);
    const e2 = new XElement('parent2');
    e2.add(child);
    const cloned = e2.nodes()[0] as XElement;
    expect(cloned).not.toBe(child);
    expect(cloned.name).toBe(child.name);
    expect(child.parent).toBe(e1);
  });
});

describe('XContainer.removeChild — indexOf guard (Bug 2)', () => {
  it('does not corrupt array when removing a non-member node', () => {
    const parent = new XElement('root', new XElement('a'), new XElement('b'));
    const orphan = new XElement('orphan');
    // Directly call removeChild with a node that is not a child
    (parent as any).removeChild(orphan);
    expect(parent.elements()).toHaveLength(2);
    expect(parent.elements()[0].name.localName).toBe('a');
    expect(parent.elements()[1].name.localName).toBe('b');
  });

  it('does not remove last child when node not found', () => {
    const parent = new XElement('root', new XElement('only'));
    const orphan = new XElement('other');
    (parent as any).removeChild(orphan);
    expect(parent.elements()).toHaveLength(1);
    expect(parent.elements()[0].name.localName).toBe('only');
  });
});

describe('XContainer.insertBeforeChild — indexOf guard (Bug 10)', () => {
  it('does not corrupt array when reference child not found', () => {
    const parent = new XElement('root', new XElement('a'), new XElement('b'));
    const orphan = new XElement('orphan');
    (parent as any).insertBeforeChild(orphan, new XElement('x'));
    // Should be unchanged
    expect(parent.elements()).toHaveLength(2);
    expect(parent.elements()[0].name.localName).toBe('a');
    expect(parent.elements()[1].name.localName).toBe('b');
  });
});

describe('XContainer.replaceChild — indexOf guard (Bug 11)', () => {
  it('does not corrupt array when reference child not found', () => {
    const parent = new XElement('root', new XElement('a'), new XElement('b'));
    const orphan = new XElement('orphan');
    (parent as any).replaceChild(orphan, new XElement('x'));
    // Should be unchanged
    expect(parent.elements()).toHaveLength(2);
    expect(parent.elements()[0].name.localName).toBe('a');
    expect(parent.elements()[1].name.localName).toBe('b');
  });
});

describe('XContainer.insertAfterChild — indexOf guard (Bug 12)', () => {
  it('does not corrupt array when reference child not found', () => {
    const parent = new XElement('root', new XElement('a'), new XElement('b'));
    const orphan = new XElement('orphan');
    (parent as any).insertAfterChild(orphan, new XElement('x'));
    // Should be unchanged
    expect(parent.elements()).toHaveLength(2);
    expect(parent.elements()[0].name.localName).toBe('a');
    expect(parent.elements()[1].name.localName).toBe('b');
  });
});

describe('XContainer.equals', () => {
  it('returns true for two empty containers', () => {
    expect(new XElement('root').equals(new XElement('root'))).toBe(true);
  });
  it('returns false when node counts differ', () => {
    const a = new XElement('root', new XText('hello'));
    const b = new XElement('root');
    expect(a.equals(b)).toBe(false);
  });
  it('returns true when child text nodes are equal', () => {
    const a = new XElement('root', new XText('hello'));
    const b = new XElement('root', new XText('hello'));
    expect(a.equals(b)).toBe(true);
  });
  it('returns false when child text node values differ', () => {
    const a = new XElement('root', new XText('hello'));
    const b = new XElement('root', new XText('world'));
    expect(a.equals(b)).toBe(false);
  });
  it('returns false when child node types differ at same position', () => {
    const a = new XElement('root', new XText('x'));
    const b = new XElement('root', new XComment('x'));
    expect(a.equals(b)).toBe(false);
  });
  it('returns true with mixed node types that are pairwise equal', () => {
    const a = new XElement('root', new XComment('c'), new XText('t'), new XCData('d'));
    const b = new XElement('root', new XComment('c'), new XText('t'), new XCData('d'));
    expect(a.equals(b)).toBe(true);
  });
});
