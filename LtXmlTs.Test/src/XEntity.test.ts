/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XEntity, XElement } from 'ltxmlts';

describe('XEntity', () => {
  it('constructs from a string and sets value', () => {
    const e = new XEntity('amp');
    expect(e.value).toBe('amp');
  });

  it('sets nodeType to Entity', () => {
    const e = new XEntity('amp');
    expect(e.nodeType).toBe('Entity');
  });

  it('copy constructor copies value from other XEntity', () => {
    const original = new XEntity('original entity');
    const copy = new XEntity(original);
    expect(copy.value).toBe('original entity');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XEntity('original entity');
    const copy = new XEntity(original);
    expect(copy).not.toBe(original);
  });
});

describe('XEntity.toString', () => {
  it('serializes as &name;', () => {
    expect(new XEntity('amp').toString()).toBe('&amp;');
  });

  it('serializes a named entity', () => {
    expect(new XEntity('nbsp').toString()).toBe('&nbsp;');
  });

  it('serializes a numeric entity', () => {
    expect(new XEntity('#160').toString()).toBe('&#160;');
  });

  it('appears correctly in element content', () => {
    const el = new XElement('root', new XEntity('amp'));
    expect(el.toString()).toBe('<root>&amp;</root>');
  });
});

describe('XEntity.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XEntity('amp').equals(new XEntity('amp'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XEntity('amp').equals(new XEntity('lt'))).toBe(false);
  });
  it('returns true for two empty-string entities', () => {
    expect(new XEntity('').equals(new XEntity(''))).toBe(true);
  });
});
