/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { XDocument, XElement, XmlParseError } from 'ltxmlts';

function writeTempXml(content: string): string {
  const name = `ltxmlts-${Date.now()}-${Math.random().toString(36).slice(2)}.xml`;
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

// ---------------------------------------------------------------------------
describe('XDocument.load (sync)', () => {
  it('parses a valid XML file and returns an XDocument', () => {
    const xml = '<root><child /></root>';
    const filePath = writeTempXml(xml);
    const doc = XDocument.load(filePath);
    expect(doc).toBeInstanceOf(XDocument);
    expect(doc.root?.name.toString()).toBe('root');
  });

  it('round-trips: toString() matches parse() output', () => {
    const xml = '<root attr="val"><child /></root>';
    const filePath = writeTempXml(xml);
    const doc = XDocument.load(filePath);
    expect(doc.toString()).toBe(XDocument.parse(xml).toString());
  });

  it('preserves XML declaration', () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><root />';
    const filePath = writeTempXml(xml);
    const doc = XDocument.load(filePath);
    expect(doc.declaration?.version).toBe('1.0');
    expect(doc.declaration?.encoding).toBe('utf-8');
  });

  it('throws XmlParseError with filePath for invalid XML', () => {
    const filePath = writeTempXml('<root><unclosed>');
    expect(() => XDocument.load(filePath)).toThrow(XmlParseError);
    try {
      XDocument.load(filePath);
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      const err = e as XmlParseError;
      expect(err.filePath).toBe(filePath);
      expect(err.line).toBeTypeOf('number');
    }
  });
});

// ---------------------------------------------------------------------------
describe('XDocument.loadAsync (async)', () => {
  it('parses a valid XML file and returns an XDocument', async () => {
    const xml = '<root><child /></root>';
    const filePath = writeTempXml(xml);
    const doc = await XDocument.loadAsync(filePath);
    expect(doc).toBeInstanceOf(XDocument);
    expect(doc.root?.name.toString()).toBe('root');
  });

  it('round-trips: toString() matches parse() output', async () => {
    const xml = '<root attr="val"><child /></root>';
    const filePath = writeTempXml(xml);
    const doc = await XDocument.loadAsync(filePath);
    expect(doc.toString()).toBe(XDocument.parse(xml).toString());
  });

  it('preserves XML declaration', async () => {
    const xml = '<?xml version="1.0" encoding="utf-8"?><root />';
    const filePath = writeTempXml(xml);
    const doc = await XDocument.loadAsync(filePath);
    expect(doc.declaration?.version).toBe('1.0');
    expect(doc.declaration?.encoding).toBe('utf-8');
  });

  it('throws XmlParseError with filePath for invalid XML', async () => {
    const filePath = writeTempXml('<root><unclosed>');
    await expect(XDocument.loadAsync(filePath)).rejects.toThrow(XmlParseError);
    try {
      await XDocument.loadAsync(filePath);
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      const err = e as XmlParseError;
      expect(err.filePath).toBe(filePath);
      expect(err.line).toBeTypeOf('number');
    }
  });
});

// ---------------------------------------------------------------------------
describe('XElement.load (sync)', () => {
  it('parses a valid XML file and returns an XElement', () => {
    const xml = '<root id="42"><child /></root>';
    const filePath = writeTempXml(xml);
    const el = XElement.load(filePath);
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
    expect(el.attribute('id')?.value).toBe('42');
  });

  it('round-trips: toString() matches original XML', () => {
    const xml = '<root><a /><b>text</b></root>';
    const filePath = writeTempXml(xml);
    const el = XElement.load(filePath);
    expect(el.toString()).toBe(xml);
  });

  it('throws XmlParseError with filePath for invalid XML', () => {
    const filePath = writeTempXml('<root><bad attr=>');
    expect(() => XElement.load(filePath)).toThrow(XmlParseError);
    try {
      XElement.load(filePath);
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      const err = e as XmlParseError;
      expect(err.filePath).toBe(filePath);
      expect(err.line).toBeTypeOf('number');
    }
  });
});

// ---------------------------------------------------------------------------
describe('XElement.loadAsync (async)', () => {
  it('parses a valid XML file and returns an XElement', async () => {
    const xml = '<root id="42"><child /></root>';
    const filePath = writeTempXml(xml);
    const el = await XElement.loadAsync(filePath);
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
    expect(el.attribute('id')?.value).toBe('42');
  });

  it('round-trips: toString() matches original XML', async () => {
    const xml = '<root><a /><b>text</b></root>';
    const filePath = writeTempXml(xml);
    const el = await XElement.loadAsync(filePath);
    expect(el.toString()).toBe(xml);
  });

  it('throws XmlParseError with filePath for invalid XML', async () => {
    const filePath = writeTempXml('<root><bad attr=>');
    await expect(XElement.loadAsync(filePath)).rejects.toThrow(XmlParseError);
    try {
      await XElement.loadAsync(filePath);
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      const err = e as XmlParseError;
      expect(err.filePath).toBe(filePath);
      expect(err.line).toBeTypeOf('number');
    }
  });
});

// ---------------------------------------------------------------------------
describe('XmlParseError.filePath', () => {
  it('XDocument.load error includes the exact file path', () => {
    const filePath = writeTempXml('<<invalid');
    try {
      XDocument.load(filePath);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      expect((e as XmlParseError).filePath).toBe(filePath);
    }
  });

  it('XElement.load error includes the exact file path', () => {
    const filePath = writeTempXml('<<invalid');
    try {
      XElement.load(filePath);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      expect((e as XmlParseError).filePath).toBe(filePath);
    }
  });

  it('XDocument.parse string errors have filePath === undefined', () => {
    try {
      XDocument.parse('<<invalid');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      expect((e as XmlParseError).filePath).toBeUndefined();
    }
  });

  it('XElement.parse string errors have filePath === undefined', () => {
    try {
      XElement.parse('<<invalid');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(XmlParseError);
      expect((e as XmlParseError).filePath).toBeUndefined();
    }
  });
});
