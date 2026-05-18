/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XContainer.Nodes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.nodes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XComment, XElement, XText } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.Nodes', () => {
  it('yields all child nodes (mixed: elements, comments, text) in document order', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", 1), new XElement("Child2", 2),
    //     new XComment("a comment"),
    //     new XElement("Child3", 3), new XElement("Child4", 4),
    //     new XText("mixed content"),
    //     new XElement("Child5", 5));
    // foreach (XNode node in xmlTree.Nodes()) Console.WriteLine(node);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XComment('a comment'),
      new XElement('Child3', 3),
      new XElement('Child4', 4),
      new XText('mixed content'),
      new XElement('Child5', 5),
    );
    for (const node of xmlTree.nodes()) {
      con.writeLine(node);
    }

    expectMatches(
      con.text(),
      `<Child1>1</Child1>
<Child2>2</Child2>
<!--a comment-->
<Child3>3</Child3>
<Child4>4</Child4>
mixed content
<Child5>5</Child5>`,
    );
  });
});
