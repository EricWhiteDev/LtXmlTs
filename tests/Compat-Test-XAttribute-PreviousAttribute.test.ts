/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.PreviousAttribute property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.previousattribute?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.PreviousAttribute', () => {
  it('walks the attribute list backward starting at LastAttribute', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", 1),
    //     new XAttribute("Att2", 2),
    //     new XAttribute("Att3", 3),
    //     new XAttribute("Att4", 4)
    // );
    // XAttribute att = root.LastAttribute;
    // do { Console.WriteLine(att); } while ((att = att.PreviousAttribute) != null);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
      new XAttribute('Att4', 4),
    );

    let att: XAttribute | null = root.lastAttribute;
    while (att !== null) {
      con.writeLine(att);
      att = att.previousAttribute;
    }

    expectMatches(
      con.text(),
      `Att4="4"
Att3="3"
Att2="2"
Att1="1"`,
    );
  });
});
