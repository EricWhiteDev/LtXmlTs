/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XContainer.ReplaceNodes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.replacenodes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.ReplaceNodes', () => {
  // COMPAT: substituted — `(int)el` → `Number(el.value)`.
  it('replaces all child nodes with the result of a self-query (snapshot semantics)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XElement("Child", 1), ..., new XElement("Child", 5));
    // root.ReplaceNodes(from el in root.Elements() where (int)el >= 3 select el);
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XElement('Child', 1),
      new XElement('Child', 2),
      new XElement('Child', 3),
      new XElement('Child', 4),
      new XElement('Child', 5),
    );
    root.replaceNodes(root.elements().filter((el) => Number(el.value) >= 3));
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Child>3</Child>
  <Child>4</Child>
  <Child>5</Child>
</Root>`,
    );
  });
});
