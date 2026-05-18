/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.NextAttribute property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.nextattribute?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.NextAttribute', () => {
  it('walks the attribute list forward starting at FirstAttribute', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", 1),
    //     new XAttribute("Att2", 2),
    //     new XAttribute("Att3", 3),
    //     new XAttribute("Att4", 4)
    // );
    // XAttribute att = root.FirstAttribute;
    // do { Console.WriteLine(att); } while ((att = att.NextAttribute) != null);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
      new XAttribute('Att4', 4),
    );

    let att: XAttribute | null = root.firstAttribute;
    while (att !== null) {
      con.writeLine(att);
      att = att.nextAttribute;
    }

    expectMatches(
      con.text(),
      `Att1="1"
Att2="2"
Att3="3"
Att4="4"`,
    );
  });
});
