/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the two C# examples from "In-memory XML tree modification vs. functional construction".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/in-memory-xml-tree-modification-vs-functional-construction

import { describe, it } from 'vitest';
import { XElement, remove } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

const data = `<Root Data1="123" Data2="456">
  <Child1>Content</Child1>
</Root>`;

describe('In-memory modification vs. functional construction (conceptual)', () => {
  // COMPAT: substituted — `XElement.Load("Data.xml")` → `XElement.parse(...)`.
  it('in-place modification: turn each attribute into a sibling child element, then strip attributes', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = XElement.Load("Data.xml");
    // foreach (XAttribute att in root.Attributes())
    //     root.Add(new XElement(att.Name, (string)att));
    // root.Attributes().Remove();
    // Console.WriteLine(root);
    // ---------------------

    const root = XElement.parse(data);
    // Snapshot the attributes (the docs note mixed declarative/imperative bugs
    // when iterating while mutating; explicit snapshot avoids the issue).
    const attrs = root.attributes();
    for (const att of attrs) {
      root.add(new XElement(att.name, att.value));
    }
    remove(root.attributes());
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>Content</Child1>
  <Data1>123</Data1>
  <Data2>456</Data2>
</Root>`,
    );
  });

  // COMPAT: substituted — `XElement.Load("Data.xml")` → `XElement.parse(...)`.
  it('functional construction: build a new tree from a query over the old one', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = XElement.Load("Data.xml");
    // XElement newTree = new XElement("Root",
    //     root.Element("Child1"),
    //     from att in root.Attributes()
    //     select new XElement(att.Name, (string)att)
    // );
    // Console.WriteLine(newTree);
    // ---------------------

    const root = XElement.parse(data);
    const newTree = new XElement(
      'Root',
      root.element('Child1'),
      root.attributes().map((att) => new XElement(att.name, att.value)),
    );
    con.writeLine(newTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>Content</Child1>
  <Data1>123</Data1>
  <Data2>456</Data2>
</Root>`,
    );
  });
});
