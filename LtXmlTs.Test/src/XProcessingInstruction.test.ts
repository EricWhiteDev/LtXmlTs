/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

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

describe('XProcessingInstruction construction validation', () => {
  it('throws when data contains ?>', () => {
    expect(() => new XProcessingInstruction('t', 'bad?>')).toThrow();
  });

  it('does not throw for ? alone in data', () => {
    expect(() => new XProcessingInstruction('t', 'x?y')).not.toThrow();
  });
});

describe('XProcessingInstruction.toString', () => {
  it('serializes with non-empty data including a separating space', () => {
    expect(new XProcessingInstruction('xml-stylesheet', 'type="text/css"').toString())
      .toBe('<?xml-stylesheet type="text/css"?>');
  });

  it('serializes with empty data omitting the space', () => {
    expect(new XProcessingInstruction('xml-stylesheet', '').toString())
      .toBe('<?xml-stylesheet?>');
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
