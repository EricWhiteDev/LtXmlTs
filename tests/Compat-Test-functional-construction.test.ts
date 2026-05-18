/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the second C# example from the "Functional construction" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/functional-construction

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Functional construction (conceptual)', () => {
  // COMPAT: substituted — `(int)el > 2` → `Number(el.value) > 2`.
  it('mixes literal children with LINQ-query results in the same constructor call', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement srcTree = new XElement("Root",
    //     new XElement("Element", 1), ..., new XElement("Element", 5));
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child", 1),
    //     new XElement("Child", 2),
    //     from el in srcTree.Elements() where (int)el > 2 select el
    // );
    // Console.WriteLine(xmlTree);
    // ---------------------

    const srcTree = new XElement(
      'Root',
      new XElement('Element', 1),
      new XElement('Element', 2),
      new XElement('Element', 3),
      new XElement('Element', 4),
      new XElement('Element', 5),
    );
    const xmlTree = new XElement(
      'Root',
      new XElement('Child', 1),
      new XElement('Child', 2),
      srcTree.elements().filter((el) => Number(el.value) > 2),
    );
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child>1</Child>
  <Child>2</Child>
  <Element>3</Element>
  <Element>4</Element>
  <Element>5</Element>
</Root>`,
    );
  });
});
