/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XNode.ElementsAfterSelf method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode.elementsafterself?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement, XText } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNode.ElementsAfterSelf', () => {
  it('ElementsAfterSelf() yields sibling elements after this node (siblings only, not descendants)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XText("Text content."),
    //     new XElement("Child1", "child1 content"), new XElement("Child2", "child2 content"),
    //     new XElement("Child3", "child3 content"),
    //     new XText("More text content."),
    //     new XElement("Child4", "child4 content"), new XElement("Child5", "child5 content"));
    // XElement child = xmlTree.Element("Child3");
    // foreach (XElement el in child.ElementsAfterSelf()) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XText('Text content.'),
      new XElement('Child1', 'child1 content'),
      new XElement('Child2', 'child2 content'),
      new XElement('Child3', 'child3 content'),
      new XText('More text content.'),
      new XElement('Child4', 'child4 content'),
      new XElement('Child5', 'child5 content'),
    );
    const child = xmlTree.element('Child3')!;
    for (const el of child.elementsAfterSelf()) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child4\nChild5`);
  });

  it('ElementsAfterSelf(XName) filters by name', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree)
    // foreach (XElement el in child.ElementsAfterSelf("Child4")) Console.WriteLine(el.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XText('Text content.'),
      new XElement('Child1', 'child1 content'),
      new XElement('Child2', 'child2 content'),
      new XElement('Child3', 'child3 content'),
      new XText('More text content.'),
      new XElement('Child4', 'child4 content'),
      new XElement('Child5', 'child5 content'),
    );
    const child = xmlTree.element('Child3')!;
    for (const el of child.elementsAfterSelf('Child4')) {
      con.writeLine(el.name);
    }

    expectMatches(con.text(), `Child4`);
  });
});
