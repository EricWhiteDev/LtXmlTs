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
  XElement, XName, XComment, XText, XEntity, XCData,
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

  it('adds XEntity with no parent', () => {
    const entity = new XEntity('amp');
    const e = new XElement(name(), entity);
    expect(e.nodes()[0]).toBe(entity);
    expect(entity.parent).toBe(e);
  });

  it('clones XEntity that already has a parent', () => {
    const entity = new XEntity('amp');
    const e1 = new XElement(name(), entity);
    const e2 = new XElement(name(), entity);
    expect(e2.nodes()[0]).not.toBe(entity);
    expect((e2.nodes()[0] as XEntity).value).toBe('amp');
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

  it('re-parents XElement that already has a parent', () => {
    const child = new XElement(XName.get('child'));
    const e1 = new XElement(name(), child);
    const e2 = new XElement(name(), child);
    expect(e2.nodes()[0]).toBe(child);
    expect(child.parent).toBe(e2);
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
