/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XElement.DescendantsAndSelf method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.descendantsandself?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XText } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.DescendantsAndSelf', () => {
  it('DescendantsAndSelf() yields this element followed by all descendant elements in document order', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XAttribute("Att1", "AttributeContent"),
    //     new XElement("Child",
    //         new XText("Some text"),
    //         new XElement("GrandChild", "element content")));
    // foreach (XElement el in xmlTree.DescendantsAndSelf()) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'AttributeContent'),
      new XElement(
        'Child',
        new XText('Some text'),
        new XElement('GrandChild', 'element content'),
      ),
    );
    for (const el of xmlTree.descendantsAndSelf()) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Root\nChild\nGrandChild`);
  });

  it('DescendantsAndSelf(XName) filters by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree)
    // foreach (XElement el in xmlTree.DescendantsAndSelf("Child")) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'AttributeContent'),
      new XElement(
        'Child',
        new XText('Some text'),
        new XElement('GrandChild', 'element content'),
      ),
    );
    for (const el of xmlTree.descendantsAndSelf('Child')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child`);
  });
});
