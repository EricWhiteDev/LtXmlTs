/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XElement.Attributes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.attributes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.Attributes', () => {
  it('Attributes() returns all attributes of this element', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XAttribute("Att1", "content1"),
    //     new XAttribute("Att2", "content2"));
    // foreach (XAttribute att in xmlTree.Attributes())
    //     Console.WriteLine(att);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'content1'),
      new XAttribute('Att2', 'content2'),
    );
    for (const att of xmlTree.attributes()) {
      con.writeLine(att);
    }

    expectMatches(
      con.text(),
      `Att1="content1"
Att2="content2"`,
    );
  });

  it('Attributes() also yields namespace-declaration attributes', () => {
    const con = createConsole();

    // ---- C# original (namespace variant) ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement xmlTree = new XElement(aw + "Root",
    //     new XAttribute(aw + "Att1", "content1"),
    //     new XAttribute(aw + "Att2", "content2"),
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"));
    // foreach (XAttribute att in xmlTree.Attributes())
    //     Console.WriteLine(att);
    // -----------------------------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const xmlTree = new XElement(
      aw + 'Root',
      new XAttribute(aw + 'Att1', 'content1'),
      new XAttribute(aw + 'Att2', 'content2'),
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
    );
    for (const att of xmlTree.attributes()) {
      con.writeLine(att);
    }

    expectMatches(
      con.text(),
      `aw:Att1="content1"
aw:Att2="content2"
xmlns:aw="http://www.adventure-works.com"`,
    );
  });

  it('Attributes(XName) filters by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XAttribute("Att1", "content1"),
    //     new XAttribute("Att2", "content2"));
    // foreach (XAttribute att in xmlTree.Attributes("Att1"))
    //     Console.WriteLine(att);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'content1'),
      new XAttribute('Att2', 'content2'),
    );
    for (const att of xmlTree.attributes('Att1')) {
      con.writeLine(att);
    }

    expectMatches(con.text(), `Att1="content1"`);
  });
});
