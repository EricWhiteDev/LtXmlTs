/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.SetElementValue method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.setelementvalue?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.SetElementValue(XName, Object)', () => {
  // COMPAT: TS port `setElementValue(name, value: string | null)` accepts only
  // strings; .NET accepts Object and stringifies. We pass pre-stringified values.
  it('add / update / remove a child element by passing a value or null', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root");
    // root.SetElementValue("Ele1", 1);
    // root.SetElementValue("Ele2", 2);
    // root.SetElementValue("Ele3", 3);
    // Console.WriteLine(root);
    // root.SetElementValue("Ele2", 22);
    // Console.WriteLine(root);
    // root.SetElementValue("Ele3", null);
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement('Root');
    root.setElementValue('Ele1', '1');
    root.setElementValue('Ele2', '2');
    root.setElementValue('Ele3', '3');
    con.writeLine(root);

    root.setElementValue('Ele2', '22');
    con.writeLine(root);

    root.setElementValue('Ele3', null);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Ele1>1</Ele1>
  <Ele2>2</Ele2>
  <Ele3>3</Ele3>
</Root>
<Root>
  <Ele1>1</Ele1>
  <Ele2>22</Ele2>
  <Ele3>3</Ele3>
</Root>
<Root>
  <Ele1>1</Ele1>
  <Ele2>22</Ele2>
</Root>`,
    );
  });
});
