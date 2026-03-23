/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XText } from 'ltxmlts';

describe('XText', () => {
  it('constructs from a string and sets value', () => {
    const t = new XText('hello');
    expect(t.value).toBe('hello');
  });

  it('sets nodeType to Text', () => {
    const t = new XText('hello');
    expect(t.nodeType).toBe('Text');
  });

  it('copy constructor copies value from other XText', () => {
    const original = new XText('original text');
    const copy = new XText(original);
    expect(copy.value).toBe('original text');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XText('original text');
    const copy = new XText(original);
    expect(copy).not.toBe(original);
  });
});

describe('XText.equals', () => {
  it('returns true when values are equal', () => {
    expect(new XText('hello').equals(new XText('hello'))).toBe(true);
  });
  it('returns false when values differ', () => {
    expect(new XText('hello').equals(new XText('world'))).toBe(false);
  });
  it('returns true for two empty-string text nodes', () => {
    expect(new XText('').equals(new XText(''))).toBe(true);
  });
});

describe('XText.toString', () => {
  it('returns the value unchanged when no special characters', () => {
    expect(new XText('hello').toString()).toBe('hello');
  });
  it('returns empty string for empty value', () => {
    expect(new XText('').toString()).toBe('');
  });
  it('escapes ampersand', () => {
    expect(new XText('a & b').toString()).toBe('a &amp; b');
  });
  it('escapes less-than', () => {
    expect(new XText('a < b').toString()).toBe('a &lt; b');
  });
  it('escapes greater-than', () => {
    expect(new XText('a > b').toString()).toBe('a &gt; b');
  });
  it('does not escape double quote', () => {
    expect(new XText('say "hi"').toString()).toBe('say "hi"');
  });
  it('does not escape single quote', () => {
    expect(new XText("it's").toString()).toBe("it's");
  });
  it('escapes multiple special characters in one value', () => {
    expect(new XText('<a & "b">').toString()).toBe('&lt;a &amp; "b"&gt;');
  });
});
