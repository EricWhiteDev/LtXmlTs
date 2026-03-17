/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

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

  it('copy constructor copies name and value', () => {
    const a = new XAttribute(XName.get('id'), 'abc');
    const b = new XAttribute(a);
    expect(b.name).toBe(XName.get('id'));
    expect(b.value).toBe('abc');
  });

  it('copy constructor sets nodeType to Attribute', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const b = new XAttribute(a);
    expect(b.nodeType).toBe('Attribute');
  });

  it('copy constructor produces a distinct object', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const b = new XAttribute(a);
    expect(b).not.toBe(a);
  });

  it('string constructor sets name via clark notation (plain)', () => {
    const a = new XAttribute('id');
    expect(a.name).toBe(XName.get('id'));
  });

  it('string constructor sets name via clark notation (namespaced)', () => {
    const a = new XAttribute('{http://example.com}id');
    expect(a.name).toBe(XName.get('{http://example.com}id'));
  });

  it('string constructor with content sets value', () => {
    const a = new XAttribute('id', '42');
    expect(a.name).toBe(XName.get('id'));
    expect(a.value).toBe('42');
  });

  it('string constructor with namespaced name and content sets value', () => {
    const a = new XAttribute('{http://example.com}id', 'val');
    expect(a.name).toBe(XName.get('{http://example.com}id'));
    expect(a.value).toBe('val');
  });
});

describe('XAttribute.equals', () => {
  it('returns true when name and value are equal', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('id', 'val'))).toBe(true);
  });
  it('returns false when names differ', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('class', 'val'))).toBe(false);
  });
  it('returns false when values differ', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('id', 'other'))).toBe(false);
  });
  it('returns true for namespaced name compared by toString', () => {
    expect(new XAttribute('{http://example.com}id', 'v')
      .equals(new XAttribute('{http://example.com}id', 'v'))).toBe(true);
  });
});
