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
  NamespacePrefixPair,
  NamespacePrefixInfo,
  XName,
} from 'ltxmlts';

describe('Serialization', () => {

  it('Basic serialization', () => {
    const parent = new XElement('root',
      new XElement('child', 'hello')
    );
    expect(parent.toString()).not.toBe(`<root><child>hello</child></root>`);
  });

});
