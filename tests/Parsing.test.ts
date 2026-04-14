/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import {
  XDocument,
  XElement,
  XAttribute,
  XComment,
  XText,
  XCData,
  XProcessingInstruction,
  XName,
  XNamespace,
  XmlParseError,
} from 'ltxmlts';
import { SaxParser } from '../src/SaxParser.js';

// ---------------------------------------------------------------------------
// XElement.parse — basics
// ---------------------------------------------------------------------------

describe('XElement.parse — basics', () => {
  it('parses a self-closing root element', () => {
    const el = XElement.parse('<root/>');
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
    expect(el.nodes().length).toBe(0);
    expect(el.attributes().length).toBe(0);
  });

  it('parses a root element with text content', () => {
    const el = XElement.parse('<root>hello</root>');
    expect(el.nodes().length).toBe(1);
    const text = el.nodes()[0];
    expect(text).toBeInstanceOf(XText);
    expect((text as XText).value).toBe('hello');
  });

  it('parses nested elements', () => {
    const el = XElement.parse('<parent><child/></parent>');
    expect(el.name.toString()).toBe('parent');
    const children = el.elements();
    expect(children.length).toBe(1);
    expect(children[0].name.toString()).toBe('child');
  });

  it('parses multiple levels of nesting', () => {
    const el = XElement.parse('<a><b><c/></b></a>');
    expect(el.element('b')!.element('c')).toBeInstanceOf(XElement);
  });
});

// ---------------------------------------------------------------------------
// XElement.parse — whitespace discarding
// ---------------------------------------------------------------------------

describe('XElement.parse — whitespace discarding', () => {
  it('discards whitespace-only text between elements', () => {
    const el = XElement.parse('<root>\n  <child/>\n</root>');
    expect(el.nodes().length).toBe(1);
    expect(el.nodes()[0]).toBeInstanceOf(XElement);
  });

  it('preserves non-whitespace text', () => {
    const el = XElement.parse('<root>  hello  </root>');
    const nodes = el.nodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0]).toBeInstanceOf(XText);
    expect((nodes[0] as XText).value).toBe('  hello  ');
  });

  it('discards whitespace-only text mixed with elements', () => {
    const el = XElement.parse('<root>\n  <a/>\n  <b/>\n</root>');
    expect(el.nodes().length).toBe(2);
    expect(el.nodes().every(n => n instanceof XElement)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// XElement.parse — attributes
// ---------------------------------------------------------------------------

describe('XElement.parse — attributes', () => {
  it('parses a simple attribute', () => {
    const el = XElement.parse('<root attr="val"/>');
    expect(el.attributes().length).toBe(1);
    const attr = el.attributes()[0];
    expect(attr.name.toString()).toBe('attr');
    expect(attr.value).toBe('val');
  });

  it('expands entity references in attribute values', () => {
    const el = XElement.parse('<root attr="a &amp; b"/>');
    expect(el.attribute('attr')!.value).toBe('a & b');
  });

  it('expands &lt; in attribute values', () => {
    const el = XElement.parse('<root attr="a &lt; b"/>');
    expect(el.attribute('attr')!.value).toBe('a < b');
  });

  it('parses multiple attributes', () => {
    const el = XElement.parse('<root a="1" b="2"/>');
    expect(el.attributes().length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// XElement.parse — namespaces
// ---------------------------------------------------------------------------

describe('XElement.parse — namespaces', () => {
  it('resolves prefixed element name to fully-qualified XName', () => {
    const el = XElement.parse('<foo:bar xmlns:foo="http://example.com"/>');
    expect(el.name.toString()).toBe('{http://example.com}bar');
    expect(el.name.namespace.namespaceName).toBe('http://example.com');
    expect(el.name.localName).toBe('bar');
  });

  it('surfaces xmlns:foo as an XAttribute on the element', () => {
    const el = XElement.parse('<foo:bar xmlns:foo="http://example.com"/>');
    const nsAttr = el.attributes().find(a => a.isNamespaceDeclaration);
    expect(nsAttr).toBeDefined();
    expect(nsAttr!.name.namespace).toBe(XNamespace.xmlns);
    expect(nsAttr!.name.localName).toBe('foo');
    expect(nsAttr!.value).toBe('http://example.com');
  });

  it('resolves default namespace declaration', () => {
    const el = XElement.parse('<bar xmlns="http://example.com"/>');
    expect(el.name.toString()).toBe('{http://example.com}bar');
    const nsAttr = el.attributes().find(a => a.isNamespaceDeclaration);
    expect(nsAttr).toBeDefined();
    expect(nsAttr!.name.localName).toBe('xmlns');
    expect(nsAttr!.value).toBe('http://example.com');
  });

  it('resolves prefixed attribute name', () => {
    const el = XElement.parse('<root foo:id="1" xmlns:foo="http://example.com"/>');
    const fooId = el.attribute(XName.get('{http://example.com}id'));
    expect(fooId).not.toBeNull();
    expect(fooId!.value).toBe('1');
  });

  it('non-prefixed attribute has no namespace', () => {
    const el = XElement.parse('<foo:root xmlns:foo="http://example.com" id="1"/>');
    const idAttr = el.attribute('id');
    expect(idAttr).not.toBeNull();
    expect(idAttr!.name.namespace).toBe(XNamespace.none);
  });

  it('inherits namespace from parent scope', () => {
    const el = XElement.parse('<foo:root xmlns:foo="http://example.com"><foo:child/></foo:root>');
    const child = el.element(XName.get('{http://example.com}child'));
    expect(child).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// XElement.parse — other node types
// ---------------------------------------------------------------------------

describe('XElement.parse — other node types', () => {
  it('parses a comment', () => {
    const el = XElement.parse('<root><!-- hi --></root>');
    const nodes = el.nodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0]).toBeInstanceOf(XComment);
    expect((nodes[0] as XComment).value).toBe(' hi ');
  });

  it('parses a CDATA section', () => {
    const el = XElement.parse('<root><![CDATA[<raw>]]></root>');
    const nodes = el.nodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0]).toBeInstanceOf(XCData);
    expect((nodes[0] as XCData).value).toBe('<raw>');
  });

  it('parses a processing instruction inside an element', () => {
    const el = XElement.parse('<root><?target data?></root>');
    const nodes = el.nodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0]).toBeInstanceOf(XProcessingInstruction);
    const pi = nodes[0] as XProcessingInstruction;
    expect(pi.target).toBe('target');
    expect(pi.data).toBe('data');
  });
});

// ---------------------------------------------------------------------------
// XElement.parse — declaration and surrounding content ignored
// ---------------------------------------------------------------------------

describe('XElement.parse — declaration and surrounding content ignored', () => {
  it('ignores the XML declaration and returns the root element', () => {
    const el = XElement.parse('<?xml version="1.0"?><root/>');
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
  });

  it('ignores comments surrounding the root element', () => {
    const el = XElement.parse('<!-- before --><root/><!-- after -->');
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
  });

  it('ignores a PI surrounding the root element', () => {
    const el = XElement.parse('<?pi before?><root/><?pi after?>');
    expect(el).toBeInstanceOf(XElement);
    expect(el.name.toString()).toBe('root');
  });
});

// ---------------------------------------------------------------------------
// XDocument.parse
// ---------------------------------------------------------------------------

describe('XDocument.parse — no declaration', () => {
  it('returns declaration: null when no XML declaration present', () => {
    const doc = XDocument.parse('<root/>');
    expect(doc.declaration).toBeNull();
  });

  it('parses the root element correctly', () => {
    const doc = XDocument.parse('<root/>');
    expect(doc.root).toBeInstanceOf(XElement);
    expect(doc.root!.name.toString()).toBe('root');
  });
});

describe('XDocument.parse — with declaration', () => {
  it('captures version from XML declaration', () => {
    const doc = XDocument.parse('<?xml version="1.0"?><root/>');
    expect(doc.declaration).not.toBeNull();
    expect(doc.declaration!.version).toBe('1.0');
    expect(doc.declaration!.encoding).toBe('');
    expect(doc.declaration!.standalone).toBe('');
  });

  it('captures encoding from XML declaration', () => {
    const doc = XDocument.parse('<?xml version="1.0" encoding="UTF-8"?><root/>');
    expect(doc.declaration!.encoding).toBe('UTF-8');
  });

  it('captures standalone from XML declaration', () => {
    const doc = XDocument.parse('<?xml version="1.0" standalone="yes"?><root/>');
    expect(doc.declaration!.standalone).toBe('yes');
  });

  it('captures all three declaration attributes', () => {
    const doc = XDocument.parse('<?xml version="1.0" encoding="UTF-8" standalone="no"?><root/>');
    expect(doc.declaration!.version).toBe('1.0');
    expect(doc.declaration!.encoding).toBe('UTF-8');
    expect(doc.declaration!.standalone).toBe('no');
  });
});

// ---------------------------------------------------------------------------
// SaxParser instance reuse
// ---------------------------------------------------------------------------

describe('SaxParser', () => {
  it('can parse two different elements sequentially with the same parser instance', () => {
    const parser = new SaxParser();

    const first = parser.parseElement('<first/>');
    const second = parser.parseElement('<second/>');

    expect(first.name.toString()).toBe('first');
    expect(second.name.toString()).toBe('second');
  });
});

describe('XDocument.parse — document-level nodes', () => {
  it('preserves comments at document level', () => {
    const doc = XDocument.parse('<!-- before --><root/><!-- after -->');
    const nodes = doc.nodes();
    expect(nodes.some(n => n instanceof XComment)).toBe(true);
  });

  it('preserves PIs at document level', () => {
    const doc = XDocument.parse('<?stylesheet href="s.css"?><root/>');
    const nodes = doc.nodes();
    expect(nodes.some(n => n instanceof XProcessingInstruction)).toBe(true);
    const pi = nodes.find(n => n instanceof XProcessingInstruction) as XProcessingInstruction;
    expect(pi.target).toBe('stylesheet');
  });
});

describe('XDocument.parse — namespaces and attributes', () => {
  it('resolves namespaces correctly in XDocument.parse', () => {
    const doc = XDocument.parse('<foo:bar xmlns:foo="http://example.com"/>');
    expect(doc.root!.name.toString()).toBe('{http://example.com}bar');
  });

  it('surfaces xmlns attribute on root in XDocument.parse', () => {
    const doc = XDocument.parse('<foo:bar xmlns:foo="http://example.com"/>');
    const nsAttr = doc.root!.attributes().find(a => a.isNamespaceDeclaration);
    expect(nsAttr).toBeDefined();
    expect(nsAttr!.value).toBe('http://example.com');
  });
});

// ---------------------------------------------------------------------------
// XmlParseError
// ---------------------------------------------------------------------------

describe('XmlParseError', () => {
  it('throws XmlParseError for an unclosed tag', () => {
    expect(() => XElement.parse('<root>')).toThrow(XmlParseError);
  });

  it('throws XmlParseError for mismatched tags', () => {
    expect(() => XElement.parse('<root></wrong>')).toThrow(XmlParseError);
  });

  it('error is instanceof XmlParseError', () => {
    let caught: unknown;
    try {
      XElement.parse('<root>');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(XmlParseError);
  });

  it('error has line and column numbers', () => {
    let caught: unknown;
    try {
      XElement.parse('<root>');
    } catch (e) {
      caught = e;
    }
    const err = caught as XmlParseError;
    expect(typeof err.line).toBe('number');
    expect(typeof err.column).toBe('number');
  });

  it('XDocument.parse also throws XmlParseError', () => {
    expect(() => XDocument.parse('<root>')).toThrow(XmlParseError);
  });
});

// ---------------------------------------------------------------------------
// Round-trip sanity
// ---------------------------------------------------------------------------

describe('Round-trip sanity', () => {
  it('serializes a simple parsed element back correctly', () => {
    const xml = '<root attr="val">text</root>';
    const el = XElement.parse(xml);
    expect(el.toString()).toBe("<root attr='val'>text</root>");
  });

  it('serializes a namespaced element back correctly', () => {
    const el = XElement.parse('<foo:bar xmlns:foo="http://example.com"/>');
    const output = el.toString();
    expect(output).toContain('http://example.com');
    expect(output).toContain('bar');
  });

  it('round-trips a document with declaration', () => {
    const doc = XDocument.parse('<?xml version="1.0" encoding="UTF-8"?><root/>');
    const output = doc.toString();
    expect(output).toContain("<?xml version='1.0' encoding='UTF-8'?>");
    expect(output).toContain('<root');
  });

  it('round-trips mixed content', () => {
    const xml = '<root><a>text</a><b/></root>';
    const el = XElement.parse(xml);
    expect(el.element('a')!.value).toBe('text');
    expect(el.element('b')).toBeInstanceOf(XElement);
  });
});
