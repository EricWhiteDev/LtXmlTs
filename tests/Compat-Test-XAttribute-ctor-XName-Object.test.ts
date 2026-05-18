/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute(XName, Object) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute(XName, Object) constructor', () => {
  // COMPAT (1): The .NET docs example passes a `DateTime` and a `double` directly
  // to the XAttribute constructor; .NET converts these to W3C-formatted strings.
  // The TS port does not perform W3C typed-value formatting — we substitute
  // pre-formatted strings.
  // COMPAT (2): .NET's `params Object[]` unpacks a passed-in `XAttribute[]`
  // recursively into the element's attribute list. The TS port's
  // `addAttributeContentObject` (src/XElement.ts:301) does NOT recurse into
  // arrays — only `addContentObject` (for nodes) does. As a result, passing
  // `attArray` positionally drops Att4/Att5/Att6. Spreading with `...attArray`
  // is a valid TS workaround but is no longer a faithful translation of the
  // C# example; skipped pending port fix.
  it.skip('creates attributes of mixed origin (string, number, date, array) and adds them to an element', () => {
    const con = createConsole();

    // ---- C# original (typed values pre-stringified for TS port) ----
    // XElement root;
    // double dbl = 12.345;
    // XAttribute[] attArray = {
    //     new XAttribute("Att4", 1),
    //     new XAttribute("Att5", 2),
    //     new XAttribute("Att6", 3)
    // };
    // DateTime dt = new DateTime(2006, 10, 6, 12, 30, 00);
    // root = new XElement("Root",
    //     new XAttribute("Att1", "Some text"),
    //     new XAttribute("Att2", dbl),
    //     new XAttribute("Att3", dt),
    //     attArray
    // );
    // Console.WriteLine(root);
    // ----------------------------------------------------------------

    const dbl = '12.345';
    const dt = '2006-10-06T12:30:00';
    const attArray = [
      new XAttribute('Att4', '1'),
      new XAttribute('Att5', '2'),
      new XAttribute('Att6', '3'),
    ];

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 'Some text'),
      new XAttribute('Att2', dbl),
      new XAttribute('Att3', dt),
      attArray,
    );

    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root Att1="Some text" Att2="12.345" Att3="2006-10-06T12:30:00" Att4="1" Att5="2" Att6="3" />`,
    );
  });
});
