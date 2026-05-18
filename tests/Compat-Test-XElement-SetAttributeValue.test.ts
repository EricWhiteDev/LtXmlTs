/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.SetAttributeValue method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.setattributevalue?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.SetAttributeValue(XName, Object)', () => {
  // COMPAT: The C# example passes integer values (e.g. `SetAttributeValue("Att1", 1)`)
  // which .NET stringifies internally. The TS port's setAttributeValue signature is
  // `(name, value: string | null)`, so we pass pre-stringified values. The
  // add/update/null-removal semantics being demonstrated are preserved.
  it('add / update / remove an attribute by passing a value or null', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root");
    // root.SetAttributeValue("Att1", 1);
    // root.SetAttributeValue("Att2", 2);
    // root.SetAttributeValue("Att3", 3);
    // Console.WriteLine(root);
    // root.SetAttributeValue("Att2", 22);
    // Console.WriteLine(root);
    // root.SetAttributeValue("Att3", null);
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement('Root');
    root.setAttributeValue('Att1', '1');
    root.setAttributeValue('Att2', '2');
    root.setAttributeValue('Att3', '3');
    con.writeLine(root);

    root.setAttributeValue('Att2', '22');
    con.writeLine(root);

    root.setAttributeValue('Att3', null);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root Att1="1" Att2="2" Att3="3" />
<Root Att1="1" Att2="22" Att3="3" />
<Root Att1="1" Att2="22" />`,
    );
  });
});
