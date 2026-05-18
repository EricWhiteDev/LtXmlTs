/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XContainer.DescendantNodes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.descendantnodes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.DescendantNodes', () => {
  it('yields all descendant XNode instances (including text), excluding attributes', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XAttribute("Att1", "AttributeContent"),
    //     new XElement("Child", new XElement("GrandChild", "element content")));
    // foreach (XNode node in xmlTree.DescendantNodes()) {
    //     if (node is XElement) Console.WriteLine((node as XElement).Name);
    //     else Console.WriteLine(node);
    // }
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XAttribute('Att1', 'AttributeContent'),
      new XElement('Child', new XElement('GrandChild', 'element content')),
    );
    for (const node of xmlTree.descendantNodes()) {
      if (node instanceof XElement) {
        con.writeLine(node.name);
      } else {
        con.writeLine(node);
      }
    }

    expectMatches(con.text(), `Child\nGrandChild\nelement content`);
  });
});
