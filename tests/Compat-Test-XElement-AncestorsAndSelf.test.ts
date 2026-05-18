/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XElement.AncestorsAndSelf method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.ancestorsandself?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.AncestorsAndSelf', () => {
  it('AncestorsAndSelf() yields this element followed by its ancestors in reverse document order', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child", new XElement("GrandChild", "element content")));
    // XElement gc = xmlTree.Element("Child").Element("GrandChild");
    // foreach (XElement el in gc.AncestorsAndSelf()) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child', new XElement('GrandChild', 'element content')),
    );
    const gc = xmlTree.element('Child')!.element('GrandChild')!;
    for (const el of gc.ancestorsAndSelf()) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `GrandChild\nChild\nRoot`);
  });

  it('AncestorsAndSelf(XName) filters by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree as above)
    // foreach (XElement el in gc.AncestorsAndSelf("Child")) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child', new XElement('GrandChild', 'element content')),
    );
    const gc = xmlTree.element('Child')!.element('GrandChild')!;
    for (const el of gc.ancestorsAndSelf('Child')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child`);
  });
});
