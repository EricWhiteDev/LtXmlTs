/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Serialization.test.ts
// Tests XML serialization across the full LtXmlTs API, including elements, attributes,
// namespaces, prefixes, declarations, comments, processing instructions, and mixed content.
// These tests are not scoped to any single class — they exercise the serialization pipeline
// end-to-end and serve as the authoritative specification for serialized XML output.

import { describe, it, expect } from 'vitest';
import {
  XmlNodeType,
  XObject,
  XNode,
  XComment,
  XText,
  XEntity,
  XCData,
  XProcessingInstruction,
  XContainer,
  XAttribute,
  XElement,
  XDeclaration,
  XDocument,
  XNamespace,
  XName,
} from 'ltxmlts';

describe('Serialization', () => {

  it('Basic serialization', () => {
    const parent = new XElement('root',
      new XElement('child', 'hello')
    );
    expect(parent.toString()).toBe(`<root><child>hello</child></root>`);
  });

  it('Serialization with namespace and prefix', () => {
    const w = new XNamespace('urn:www');
    const parent = new XElement(w + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:www'),
      new XAttribute('foo', 'bar'),
      new XElement(w + 'child', 'hello')
    );
    expect(parent.toString()).toBe(`<w:root xmlns:w='urn:www' foo='bar'><w:child>hello</w:child></w:root>`);
  });

  it('auto-generates a p# prefix for an element in an undeclared namespace', () => {
    const foo = new XNamespace('urn:test:autogen:element');
    const root = new XElement(foo + 'root');
    expect(root.toString()).toBe("<p0:root xmlns:p0='urn:test:autogen:element' />");
  });

  it('auto-generates a p# prefix for an attribute in an undeclared namespace', () => {
    const bar = new XNamespace('urn:test:autogen:attr');
    const root = new XElement('root',
      new XAttribute(bar + 'lang', 'en')
    );
    expect(root.toString()).toBe("<root p0:lang='en' xmlns:p0='urn:test:autogen:attr' />");
  });

  it('auto-generates distinct p# prefixes for element and attribute in different undeclared namespaces', () => {
    const ns1 = new XNamespace('urn:test:autogen:multi1');
    const ns2 = new XNamespace('urn:test:autogen:multi2');
    const root = new XElement(ns1 + 'root',
      new XAttribute(ns2 + 'attr', 'val')
    );
    expect(root.toString()).toBe(
      "<p1:root p0:attr='val' xmlns:p0='urn:test:autogen:multi2' xmlns:p1='urn:test:autogen:multi1' />"
    );
  });

  it('generates only one p# declaration when element and attribute share the same undeclared namespace', () => {
    const ns = new XNamespace('urn:test:autogen:shared');
    const root = new XElement(ns + 'root',
      new XAttribute(ns + 'attr', 'val')
    );
    expect(root.toString()).toBe(
      "<p0:root p0:attr='val' xmlns:p0='urn:test:autogen:shared' />"
    );
  });

  it('calling toString() twice produces the same result after cleanup', () => {
    const foo = new XNamespace('urn:test:autogen:idempotent');
    const root = new XElement(foo + 'root');
    const first = root.toString();
    const second = root.toString();
    expect(first).toBe(second);
  });

  it('prefix collision in child does not corrupt parent element prefix', () => {
    // Parent declares xmlns:w for urn:collision-test:parent.
    // Child re-declares the same prefix w for a different namespace, triggering the collision
    // path in populateNamespacePrefixInfoRecurse. Before the fix, the shallow-copied
    // NamespacePrefixPair was shared, so mutating its prefix bled into the parent's info,
    // causing the parent element to serialize with the wrong prefix.
    const urnParent = new XNamespace('urn:collision-test:parent');
    const root = new XElement(urnParent + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:collision-test:parent'),
      new XElement('child',
        new XAttribute(XNamespace.xmlns + 'w', 'urn:collision-test:child')
      )
    );
    expect(root.toString()).toBe(
      "<w:root xmlns:w='urn:collision-test:parent'><child xmlns:w='urn:collision-test:child' /></w:root>"
    );
  });

});
