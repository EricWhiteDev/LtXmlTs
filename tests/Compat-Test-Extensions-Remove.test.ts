/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from Extensions.Remove method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.extensions.remove?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, remove } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Extensions.Remove', () => {
  // COMPAT: substituted — `(int)at` → `Number(at.value)`.
  it('Remove(IEnumerable<XAttribute>) detaches each attribute from its parent', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", 1), ..., new XAttribute("Att5", 5));
    // var atList = from at in root.Attributes() where (int)at >= 3 select at;
    // atList.Remove();
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
      new XAttribute('Att4', 4),
      new XAttribute('Att5', 5),
    );
    const atList = root.attributes().filter((at) => Number(at.value) >= 3);
    remove(atList);
    con.writeLine(root);

    expectMatches(con.text(), `<Root Att1="1" Att2="2" />`);
  });

  // COMPAT: substituted — `(int)el` → `Number(el.value)`.
  it('Remove<T>(IEnumerable<T>) detaches each node from its parent', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XElement("Data", 1), ..., new XElement("Data", 5));
    // var elList = from el in root.Elements() where (int)el >= 3 select el;
    // elList.Remove();
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XElement('Data', 1),
      new XElement('Data', 2),
      new XElement('Data', 3),
      new XElement('Data', 4),
      new XElement('Data', 5),
    );
    const elList = root.elements().filter((el) => Number(el.value) >= 3);
    remove(elList);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Data>1</Data>
  <Data>2</Data>
</Root>`,
    );
  });
});
