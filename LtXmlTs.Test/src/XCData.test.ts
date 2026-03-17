/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XCData } from 'ltxmlts';

describe('XCData', () => {
  it('constructs from a string and sets value', () => {
    const c = new XCData('<greeting>hello</greeting>');
    expect(c.value).toBe('<greeting>hello</greeting>');
  });

  it('sets nodeType to CDATA', () => {
    const c = new XCData('<greeting>hello</greeting>');
    expect(c.nodeType).toBe('CDATA');
  });

  it('copy constructor copies value from other XCData', () => {
    const original = new XCData('original cdata');
    const copy = new XCData(original);
    expect(copy.value).toBe('original cdata');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XCData('original cdata');
    const copy = new XCData(original);
    expect(copy).not.toBe(original);
  });
});

describe('XCData.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XCData('hello').equals(new XCData('hello'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XCData('hello').equals(new XCData('world'))).toBe(false);
  });
  it('returns true for two empty-string CDATA nodes', () => {
    expect(new XCData('').equals(new XCData(''))).toBe(true);
  });
});
