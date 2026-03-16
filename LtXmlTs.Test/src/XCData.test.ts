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
