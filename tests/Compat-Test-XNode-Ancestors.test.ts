/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XNode.Ancestors method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode.ancestors?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement, ancestors } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNode.Ancestors', () => {
  it('Ancestors() returns ancestor elements in reverse document order', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child",
    //         new XElement("GrandChild", "content")));
    // IEnumerable<XElement> grandChild = xmlTree.Descendants("GrandChild");
    // foreach (XElement el in grandChild.Ancestors())  // Extensions.Ancestors
    //     Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child', new XElement('GrandChild', 'content')),
    );
    const grandChild = xmlTree.descendants('GrandChild');
    for (const el of ancestors(grandChild)) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child\nRoot`);
  });

  it('Ancestors(XName) filters ancestors by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree)
    // foreach (XElement el in grandChild.Ancestors("Child"))
    //     Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child', new XElement('GrandChild', 'content')),
    );
    const grandChild = xmlTree.descendants('GrandChild');
    for (const el of ancestors(grandChild, 'Child')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child`);
  });
});
