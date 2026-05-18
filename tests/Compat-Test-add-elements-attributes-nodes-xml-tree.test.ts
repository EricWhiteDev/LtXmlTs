/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the "Add elements, attributes, and nodes to an XML tree"
// conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/add-elements-attributes-nodes-xml-tree

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Add elements, attributes, and nodes to an XML tree (conceptual)', () => {
  // COMPAT: substituted — `(int)el > 3` → `Number(el.value) > 3`.
  it('Add accepts a single element, a LINQ-query result, and a null-yielding lookup', () => {
    const con = createConsole();

    // ---- C# original ----
    // var srcTree = new XElement("Root",
    //     new XElement("Element1", 1), ..., new XElement("Element5", 5));
    // var xmlTree = new XElement("Root",
    //     new XElement("Child1", 1), ..., new XElement("Child5", 5));
    // xmlTree.Add(new XElement("NewChild", "new content"));
    // xmlTree.Add(from el in srcTree.Elements() where (int)el > 3 select el);
    // xmlTree.Add(srcTree.Element("Child9"));  // null, no-op
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

    xmlTree.add(new XElement('NewChild', 'new content'));
    xmlTree.add(srcTree.elements().filter((el) => Number(el.value) > 3));
    xmlTree.add(srcTree.element('Child9'));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
  <Child4>4</Child4>
  <Child5>5</Child5>
  <NewChild>new content</NewChild>
  <Element4>4</Element4>
  <Element5>5</Element5>
</Root>`,
    );
  });
});
