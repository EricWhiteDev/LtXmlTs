/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XNode.ReplaceWith method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode.replacewith?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNode.ReplaceWith', () => {
  it('ReplaceWith(Object) replaces this node with a single new node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", "child1 content"), ..., new XElement("Child5", "child5 content"));
    // XElement child3 = xmlTree.Element("Child3");
    // child3.ReplaceWith(new XElement("NewChild", "new content"));
    // Console.WriteLine(xmlTree);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 'child1 content'),
      new XElement('Child2', 'child2 content'),
      new XElement('Child3', 'child3 content'),
      new XElement('Child4', 'child4 content'),
      new XElement('Child5', 'child5 content'),
    );
    const child3 = xmlTree.element('Child3')!;
    child3.replaceWith(new XElement('NewChild', 'new content'));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>child1 content</Child1>
  <Child2>child2 content</Child2>
  <NewChild>new content</NewChild>
  <Child4>child4 content</Child4>
  <Child5>child5 content</Child5>
</Root>`,
    );
  });

  // COMPAT: substituted — C# `(int)el > 3` → `Number(el.value) > 3`.
  it('ReplaceWith(Object[]) replaces this node with the flattened content of an IEnumerable', () => {
    const con = createConsole();

    // ---- C# original ----
    // (srcTree with Element1..5 + xmlTree with Child1..5, numeric values)
    // child3.ReplaceWith(from el in srcTree.Elements() where (int)el > 3 select el);
    // Console.WriteLine(xmlTree);
    // ---------------------

    const srcTree = new XElement(
      'Root',
      new XElement('Element1', 1),
      new XElement('Element2', 2),
      new XElement('Element3', 3),
      new XElement('Element4', 4),
      new XElement('Element5', 5),
    );
    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XElement('Child3', 3),
      new XElement('Child4', 4),
      new XElement('Child5', 5),
    );
    const child3 = xmlTree.element('Child3')!;
    child3.replaceWith(srcTree.elements().filter((el) => Number(el.value) > 3));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Element4>4</Element4>
  <Element5>5</Element5>
  <Child4>4</Child4>
  <Child5>5</Child5>
</Root>`,
    );
  });
});
