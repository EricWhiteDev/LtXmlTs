/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.RemoveAttributes method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.removeattributes?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.RemoveAttributes', () => {
  it('removes only attributes, leaving child nodes intact', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", 1), new XAttribute("Att2", 2), new XAttribute("Att3", 3),
    //     new XElement("Child1", 1), new XElement("Child2", 2), new XElement("Child3", 3));
    // root.RemoveAttributes();
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 1),
      new XAttribute('Att2', 2),
      new XAttribute('Att3', 3),
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XElement('Child3', 3),
    );
    root.removeAttributes();
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
</Root>`,
    );
  });
});
