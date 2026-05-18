/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XContainer.AddFirst method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.addfirst?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.AddFirst', () => {
  // COMPAT: substituted — `(int)el` → `Number(el.value)`.
  it('prepends content (LINQ-query result) to the existing children', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement srcTree = new XElement("Root",
    //     new XElement("Element1", 1), ..., new XElement("Element5", 5));
    // XElement xmlTree = new XElement("Root", new XElement("NewElement", "Content"));
    // xmlTree.AddFirst(
    //     from el in srcTree.Elements() where (int)el >= 3 select el
    // );
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
    const xmlTree = new XElement('Root', new XElement('NewElement', 'Content'));
    xmlTree.addFirst(srcTree.elements().filter((el) => Number(el.value) >= 3));
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Element3>3</Element3>
  <Element4>4</Element4>
  <Element5>5</Element5>
  <NewElement>Content</NewElement>
</Root>`,
    );
  });
});
