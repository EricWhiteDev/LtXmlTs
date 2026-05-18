/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XContainer.Descendants method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.descendants?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace, XText } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.Descendants', () => {
  it('Descendants() returns all descendant elements (excluding self) in document order', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XAttribute("Att1", "AttributeContent"),
    //     new XElement("Child",
    //         new XText("Some text"),
    //         new XElement("GrandChild", "element content")
    //     )
    // );
    // IEnumerable<XElement> de = from el in xmlTree.Descendants() select el;
    // foreach (XElement el in de) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'AttributeContent'),
      new XElement('Child', new XText('Some text'), new XElement('GrandChild', 'element content')),
    );
    for (const el of xmlTree.descendants()) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child\nGrandChild`);
  });

  it('Descendants(XName) filters by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree as above)
    // foreach (XElement el in xmlTree.Descendants("Child")) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'AttributeContent'),
      new XElement('Child', new XText('Some text'), new XElement('GrandChild', 'element content')),
    );
    for (const el of xmlTree.descendants('Child')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child`);
  });

  it('Descendants(XName) — namespaced names use Clark notation', () => {
    const con = createConsole();

    // ---- C# original (namespace variant) ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement xmlTree = new XElement(aw + "Root",
    //     new XAttribute(aw + "Att1", "AttributeContent"),
    //     new XElement(aw + "Child",
    //         new XText("Some text"),
    //         new XElement(aw + "GrandChild", "element content")
    //     )
    // );
    // foreach (XElement el in xmlTree.Descendants(aw + "Child"))
    //     Console.WriteLine(el.Name);
    // -----------------------------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const xmlTree = new XElement(
      aw + 'Root',
      new XAttribute(aw + 'Att1', 'AttributeContent'),
      new XElement(
        aw + 'Child',
        new XText('Some text'),
        new XElement(aw + 'GrandChild', 'element content'),
      ),
    );
    for (const el of xmlTree.descendants(aw + 'Child')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `{http://www.adventure-works.com}Child`);
  });
});
