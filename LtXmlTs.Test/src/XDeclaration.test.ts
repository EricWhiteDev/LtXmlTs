/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XDeclaration } from 'ltxmlts';

describe('XDeclaration', () => {
  it('constructs from three strings and sets version', () => {
    const d = new XDeclaration('1.0', 'utf-8', 'yes');
    expect(d.version).toBe('1.0');
  });

  it('constructs from three strings and sets encoding', () => {
    const d = new XDeclaration('1.0', 'utf-8', 'yes');
    expect(d.encoding).toBe('utf-8');
  });

  it('constructs from three strings and sets standalone', () => {
    const d = new XDeclaration('1.0', 'utf-8', 'yes');
    expect(d.standalone).toBe('yes');
  });

  it('copy constructor copies version', () => {
    const original = new XDeclaration('1.0', 'utf-8', 'yes');
    const copy = new XDeclaration(original);
    expect(copy.version).toBe('1.0');
  });

  it('copy constructor copies encoding', () => {
    const original = new XDeclaration('1.0', 'utf-8', 'yes');
    const copy = new XDeclaration(original);
    expect(copy.encoding).toBe('utf-8');
  });

  it('copy constructor copies standalone', () => {
    const original = new XDeclaration('1.0', 'utf-8', 'yes');
    const copy = new XDeclaration(original);
    expect(copy.standalone).toBe('yes');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XDeclaration('1.0', 'utf-8', 'yes');
    const copy = new XDeclaration(original);
    expect(copy).not.toBe(original);
  });
});

describe('XDeclaration.toString', () => {
  it('serializes a full declaration with version, encoding, and standalone', () => {
    expect(new XDeclaration('1.0', 'utf-8', 'yes').toString())
      .toBe("<?xml version='1.0' encoding='utf-8' standalone='yes'?>");
  });

  it('omits encoding and standalone when both are empty', () => {
    expect(new XDeclaration('1.0', '', '').toString())
      .toBe("<?xml version='1.0'?>");
  });

  it('omits standalone when empty but includes encoding', () => {
    expect(new XDeclaration('1.0', 'utf-8', '').toString())
      .toBe("<?xml version='1.0' encoding='utf-8'?>");
  });
});

describe('XDeclaration.equals', () => {
  it('returns true when all three properties are equal', () => {
    expect(new XDeclaration('1.0', 'utf-8', 'yes')
      .equals(new XDeclaration('1.0', 'utf-8', 'yes'))).toBe(true);
  });
  it('returns false when version differs', () => {
    expect(new XDeclaration('1.0', 'utf-8', 'yes')
      .equals(new XDeclaration('1.1', 'utf-8', 'yes'))).toBe(false);
  });
  it('returns false when encoding differs', () => {
    expect(new XDeclaration('1.0', 'utf-8', 'yes')
      .equals(new XDeclaration('1.0', 'utf-16', 'yes'))).toBe(false);
  });
  it('returns false when standalone differs', () => {
    expect(new XDeclaration('1.0', 'utf-8', 'yes')
      .equals(new XDeclaration('1.0', 'utf-8', 'no'))).toBe(false);
  });
});
