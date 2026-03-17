import { describe, it, expect } from 'vitest';
import { XProcessingInstruction } from 'ltxmlts';

describe('XProcessingInstruction', () => {
  it('sets nodeType to ProcessingInstruction', () => {
    const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    expect(pi.nodeType).toBe('ProcessingInstruction');
  });

  it('constructor sets target', () => {
    const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    expect(pi.target).toBe('xml-stylesheet');
  });

  it('constructor sets data', () => {
    const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    expect(pi.data).toBe('type="text/css"');
  });

  it('copy constructor copies target and data', () => {
    const original = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    const copy = new XProcessingInstruction(original);
    expect(copy.target).toBe('xml-stylesheet');
    expect(copy.data).toBe('type="text/css"');
  });

  it('copy constructor produces an independent object', () => {
    const original = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
    const copy = new XProcessingInstruction(original);
    expect(copy).not.toBe(original);
  });
});

describe('XProcessingInstruction.equals', () => {
  it('returns true when target and data are equal', () => {
    expect(new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
      .equals(new XProcessingInstruction('xml-stylesheet', 'type="text/css"'))).toBe(true);
  });
  it('returns false when targets differ', () => {
    expect(new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
      .equals(new XProcessingInstruction('other', 'type="text/css"'))).toBe(false);
  });
  it('returns false when data differs', () => {
    expect(new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
      .equals(new XProcessingInstruction('xml-stylesheet', 'type="text/xsl"'))).toBe(false);
  });
  it('returns true when both target and data are empty strings', () => {
    expect(new XProcessingInstruction('', '').equals(new XProcessingInstruction('', ''))).toBe(true);
  });
});
