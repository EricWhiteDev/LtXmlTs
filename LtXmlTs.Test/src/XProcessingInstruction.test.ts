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
