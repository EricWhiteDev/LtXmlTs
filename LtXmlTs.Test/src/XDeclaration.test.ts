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
