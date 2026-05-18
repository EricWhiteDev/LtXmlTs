/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.ReplaceAttributes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.replaceattributes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.ReplaceAttributes', () => {
  it('ReplaceAttributes(Object) with a single XAttribute replaces all attributes', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", 1), new XAttribute("Att2", 2), new XAttribute("Att3", 3));
    // root.ReplaceAttributes(new XAttribute("NewAtt1", 101));
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
    );
    root.replaceAttributes(new XAttribute('NewAtt1', 101));
    con.writeLine(root);

    expectMatches(con.text(), `<Root NewAtt1="101" />`);
  });

  it('ReplaceAttributes(Object[]) with multiple XAttribute args replaces all attributes', () => {
    const con = createConsole();

    // ---- C# original ----
    // root.ReplaceAttributes(
    //     new XAttribute("NewAtt1", 101),
    //     new XAttribute("NewAtt2", 102),
    //     new XAttribute("NewAtt3", 103));
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
    );
    root.replaceAttributes(
      new XAttribute('NewAtt1', 101),
      new XAttribute('NewAtt2', 102),
      new XAttribute('NewAtt3', 103),
    );
    con.writeLine(root);

    expectMatches(con.text(), `<Root NewAtt1="101" NewAtt2="102" NewAtt3="103" />`);
  });
});
