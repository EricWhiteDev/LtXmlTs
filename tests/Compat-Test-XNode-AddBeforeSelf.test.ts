/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XNode.AddBeforeSelf method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode.addbeforeself?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNode.AddBeforeSelf', () => {
  it('AddBeforeSelf(Object) inserts a single new node before this one', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", 1), ..., new XElement("Child5", 5));
    // XElement child1 = xmlTree.Element("Child1");
    // child1.AddBeforeSelf(new XElement("NewChild", 10));
    // Console.WriteLine(xmlTree);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XElement('Child3', 3),
      new XElement('Child4', 4),
      new XElement('Child5', 5),
    );
    const child1 = xmlTree.element('Child1')!;
    child1.addBeforeSelf(new XElement('NewChild', 10));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <NewChild>10</NewChild>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
  <Child4>4</Child4>
  <Child5>5</Child5>
</Root>`,
    );
  });

  // COMPAT: substituted — C# `(int)el > 3` → `Number(el.value) > 3`.
  it('AddBeforeSelf(Object[]) flattens an IEnumerable into multiple inserted nodes', () => {
    const con = createConsole();

    // ---- C# original ----
    // (srcTree + xmlTree with Child1..5)
    // child1.AddBeforeSelf(from el in srcTree.Elements() where (int)el > 3 select el);
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
    const child1 = xmlTree.element('Child1')!;
    child1.addBeforeSelf(srcTree.elements().filter((el) => Number(el.value) > 3));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Element4>4</Element4>
  <Element5>5</Element5>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
  <Child4>4</Child4>
  <Child5>5</Child5>
</Root>`,
    );
  });
});
