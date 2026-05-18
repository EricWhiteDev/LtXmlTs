/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the XDocument class-overview reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocument?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XDocument, XElement, XComment } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XDocument class overview', () => {
  it('builds a tree, queries it, and prints the filtered document', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument srcTree = new XDocument(
    //     new XComment("This is a comment"),
    //     new XElement("Root",
    //         new XElement("Child1", "data1"),
    //         new XElement("Child2", "data2"),
    //         new XElement("Child3", "data3"),
    //         new XElement("Child2", "data4"),
    //         new XElement("Info5", "info5"),
    //         new XElement("Info6", "info6"),
    //         new XElement("Info7", "info7"),
    //         new XElement("Info8", "info8")
    //     )
    // );
    // XDocument doc = new XDocument(
    //     new XComment("This is a comment"),
    //     new XElement("Root",
    //         from el in srcTree.Element("Root").Elements()
    //         where ((string)el).StartsWith("data")
    //         select el
    //     )
    // );
    // Console.WriteLine(doc);
    // ---------------------

    const srcTree = new XDocument(
      new XComment('This is a comment'),
      new XElement(
        'Root',
        new XElement('Child1', 'data1'),
        new XElement('Child2', 'data2'),
        new XElement('Child3', 'data3'),
        new XElement('Child2', 'data4'),
        new XElement('Info5', 'info5'),
        new XElement('Info6', 'info6'),
        new XElement('Info7', 'info7'),
        new XElement('Info8', 'info8'),
      ),
    );

    const doc = new XDocument(
      new XComment('This is a comment'),
      new XElement(
        'Root',
        srcTree
          .element('Root')!
          .elements()
          .filter((el) => el.value.startsWith('data')),
      ),
    );

    con.writeLine(doc);

    expectMatches(
      con.text(),
      `<!--This is a comment-->
<Root>
  <Child1>data1</Child1>
  <Child2>data2</Child2>
  <Child3>data3</Child3>
  <Child2>data4</Child2>
</Root>`,
    );
  });
});
