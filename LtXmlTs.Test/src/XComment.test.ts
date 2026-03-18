/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XComment } from 'ltxmlts';

describe('XComment', () => {
  it('constructs from a string and sets value', () => {
    const c = new XComment('hello');
    expect(c.value).toBe('hello');
  });

  it('sets nodeType to Comment', () => {
    const c = new XComment('hello');
    expect(c.nodeType).toBe('Comment');
  });

  it('copy constructor copies value from other XComment', () => {
    const original = new XComment('original text');
    const copy = new XComment(original);
    expect(copy.value).toBe('original text');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XComment('original text');
    const copy = new XComment(original);
    expect(copy).not.toBe(original);
  });
});

describe('XComment.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XComment('hello').equals(new XComment('hello'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XComment('hello').equals(new XComment('world'))).toBe(false);
  });
  it('returns true for two empty-string comments', () => {
    expect(new XComment('').equals(new XComment(''))).toBe(true);
  });
});

describe('XComment.toString', () => {
  it("serializes a comment as <!--value-->", () => {
    expect(new XComment('hello').toString()).toBe('<!--hello-->');
  });

  it("handles an empty value", () => {
    expect(new XComment('').toString()).toBe('<!---->');
  });

  it("handles a value containing spaces", () => {
    expect(new XComment('hello world').toString()).toBe('<!--hello world-->');
  });

  it("template literal interpolation produces the same result as explicit toString()", () => {
    const c = new XComment('test');
    expect(`${c}`).toBe(c.toString());
  });
});
