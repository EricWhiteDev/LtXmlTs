/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XNode.DeepEquals(XNode, XNode) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode.deepequals?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNode } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNode.DeepEquals(XNode, XNode)', () => {
  it('returns True for structurally identical trees', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree1 = new XElement("Root",
    //     new XAttribute("Att1", 1), new XAttribute("Att2", 2),
    //     new XElement("Child1", 1), new XElement("Child2", "some content"));
    // XElement xmlTree2 = new XElement("Root",
    //     new XAttribute("Att1", 1), new XAttribute("Att2", 2),
    //     new XElement("Child1", 1), new XElement("Child2", "some content"));
    // Console.WriteLine(XNode.DeepEquals(xmlTree1, xmlTree2));
    // ---------------------

    const xmlTree1 = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XElement('Child1', 1),
      new XElement('Child2', 'some content'),
    );
    const xmlTree2 = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XElement('Child1', 1),
      new XElement('Child2', 'some content'),
    );
    con.writeLine(XNode.deepEquals(xmlTree1, xmlTree2));

    expectMatches(con.text(), `True`);
  });
});
