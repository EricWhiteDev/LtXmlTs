/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XElement.ReplaceAll method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.replaceall?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.ReplaceAll', () => {
  // COMPAT: substituted — `(int)el` → `Number(el.value)`.
  it('ReplaceAll(Object) — replaces all children with a LINQ-query result (snapshot semantics)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Data", 1), ..., new XElement("Data", 5));
    // xmlTree.ReplaceAll(
    //     from el in xmlTree.Elements()
    //     where (int)el >= 3
    //     select new XElement("NewData", (int)el)
    // );
    // Console.WriteLine(xmlTree);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Data', 1),
      new XElement('Data', 2),
      new XElement('Data', 3),
      new XElement('Data', 4),
      new XElement('Data', 5),
    );

    xmlTree.replaceAll(
      xmlTree
        .elements()
        .filter((el) => Number(el.value) >= 3)
        .map((el) => new XElement('NewData', Number(el.value))),
    );

    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <NewData>3</NewData>
  <NewData>4</NewData>
  <NewData>5</NewData>
</Root>`,
    );
  });

  it('ReplaceAll(Object) with a single XElement replaces all content', () => {
    const con = createConsole();

    // ---- C# original (sub-case from the 8-step overload example) ----
    // XElement root = new XElement("Root", new XElement("Child", "child content"));
    // root.ReplaceAll(new XElement("NewChild", "n"));
    // Console.WriteLine(root);
    // -----------------------------------------------------------------

    const root = new XElement('Root', new XElement('Child', 'child content'));
    root.replaceAll(new XElement('NewChild', 'n'));
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <NewChild>n</NewChild>
</Root>`,
    );
  });

  it('ReplaceAll(Object) with a single XAttribute replaces all content', () => {
    const con = createConsole();

    // ---- C# original ----
    // root.ReplaceAll(new XAttribute("NewAttribute", "n"));
    // ---------------------

    const root = new XElement('Root', new XElement('Child', 'child content'));
    root.replaceAll(new XAttribute('NewAttribute', 'n'));
    con.writeLine(root);

    expectMatches(con.text(), `<Root NewAttribute="n" />`);
  });

  it('ReplaceAll(Object) with a string replaces all content with text', () => {
    const con = createConsole();

    // ---- C# original ----
    // root.ReplaceAll("Some text");
    // ---------------------

    const root = new XElement('Root', new XElement('Child', 'child content'));
    root.replaceAll('Some text');
    con.writeLine(root);

    expectMatches(con.text(), `<Root>Some text</Root>`);
  });
});
