/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XElement.Attribute(XName) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.attribute?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.Attribute(XName)', () => {
  it('returns a single matching XAttribute', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root", new XAttribute("Att", "attribute content"));
    // XAttribute att = xmlTree.Attribute("Att");
    // Console.WriteLine(att);
    // ---------------------

    const xmlTree = new XElement('Root', new XAttribute('Att', 'attribute content'));
    const att = xmlTree.attribute('Att')!;
    con.writeLine(att);

    expectMatches(con.text(), `Att="attribute content"`);
  });

  it('returns a namespaced attribute (prefixed name in serialization)', () => {
    const con = createConsole();

    // ---- C# original (namespace variant) ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement xmlTree = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XAttribute(aw + "Att", "attribute content"));
    // XAttribute att = xmlTree.Attribute(aw + "Att");
    // Console.WriteLine(att);
    // -----------------------------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const xmlTree = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XAttribute(aw + 'Att', 'attribute content'),
    );
    const att = xmlTree.attribute(aw + 'Att')!;
    con.writeLine(att);

    expectMatches(con.text(), `aw:Att="attribute content"`);
  });
});
