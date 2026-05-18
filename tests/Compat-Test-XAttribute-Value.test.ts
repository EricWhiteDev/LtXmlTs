/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the two C# examples from XAttribute.Value property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.value?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.Value', () => {
  it('gets and sets the value of an existing attribute', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root", new XAttribute("Att", "content"));
    // XAttribute att = root.FirstAttribute;
    // Console.WriteLine(att.Value);
    // att.Value = "new text";
    // Console.WriteLine(att.Value);
    // ---------------------

    const root = new XElement('Root', new XAttribute('Att', 'content'));
    const att = root.firstAttribute!;
    con.writeLine(att.value);
    att.value = 'new text';
    con.writeLine(att.value);

    expectMatches(
      con.text(),
      `content
new text`,
    );
  });

  // COMPAT: substituted — the .NET docs example uses C# explicit cast operators
  // (string)attr / (int?)attr that return null when attr is null. TS has no such
  // operator. We substitute `attr?.value ?? null` and `attr ? Number(attr.value) : null`
  // which models the same null-tolerant coercion. Semantics tested identically.
  it('demonstrates null-tolerant coercion vs explicit null-check on .Value', () => {
    const con = createConsole();

    // ---- C# original (cast operators -> JS coercion) ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", "attribute 1 content"),
    //     new XAttribute("Att2", "2")
    // );
    // string c1 = (string)root.Attribute("Att1");
    // int? c2 = (int?)root.Attribute("Att2");
    // string c3 = (string)root.Attribute("Att3");   // missing
    // int? c4 = (int?)root.Attribute("Att4");        // missing
    // -----------------------------------------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 'attribute 1 content'),
      new XAttribute('Att2', '2'),
    );

    const c1 = root.attribute('Att1')?.value ?? null;
    con.writeLine(`c1:${c1 === null ? 'attribute does not exist' : c1}`);

    const att2 = root.attribute('Att2');
    const c2: number | null = att2 ? Number(att2.value) : null;
    con.writeLine(`c2:${c2 === null ? 'attribute does not exist' : c2.toString()}`);

    const c3 = root.attribute('Att3')?.value ?? null;
    con.writeLine(`c3:${c3 === null ? 'attribute does not exist' : c3}`);

    const att4 = root.attribute('Att4');
    const c4: number | null = att4 ? Number(att4.value) : null;
    con.writeLine(`c4:${c4 === null ? 'attribute does not exist' : c4.toString()}`);

    con.writeLine();

    // Verbose null-check style on the .Value property:
    const att1 = root.attribute('Att1');
    const v1 = att1 === null ? null : att1.value;
    con.writeLine(`v1:${v1 === null ? 'attribute does not exist' : v1}`);

    const att2b = root.attribute('Att2');
    const v2: number | null = att2b === null ? null : Number.parseInt(att2b.value, 10);
    con.writeLine(`v2:${v2 === null ? 'attribute does not exist' : v2.toString()}`);

    const att3 = root.attribute('Att3');
    const v3 = att3 === null ? null : att3.value;
    con.writeLine(`v3:${v3 === null ? 'attribute does not exist' : v3}`);

    const att4b = root.attribute('Att4');
    const v4: number | null = att4b === null ? null : Number.parseInt(att4b.value, 10);
    con.writeLine(`v4:${v4 === null ? 'attribute does not exist' : v4.toString()}`);

    expectMatches(
      con.text(),
      `c1:attribute 1 content
c2:2
c3:attribute does not exist
c4:attribute does not exist

v1:attribute 1 content
v2:2
v3:attribute does not exist
v4:attribute does not exist`,
    );
  });
});
