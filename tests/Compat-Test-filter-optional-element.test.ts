/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to filter on an optional element".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/filter-optional-element

import { describe, it } from 'vitest';
import { XElement, elements as elementsAxis } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Filter on an optional element (conceptual)', () => {
  // COMPAT: substituted — Extensions.Elements over a sequence of XElement →
  // standalone `elements(seq, name)` function from the TS port.
  it('chained .Elements().Elements("Type") survives elements that lack the child', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
  <Child1><Text>Child One Text</Text><Type Value="Yes"/></Child1>
  <Child2><Text>Child Two Text</Text><Type Value="Yes"/></Child2>
  <Child3><Text>Child Three Text</Text><Type Value="No"/></Child3>
  <Child4><Text>Child Four Text</Text><Type Value="Yes"/></Child4>
  <Child5><Text>Child Five Text</Text></Child5>
</Root>`);

    const types = elementsAxis(root.elements(), 'Type');
    const cList = types
      .filter((t) => t.attribute('Value')?.value === 'Yes')
      .map((t) => t.parent!.element('Text')!.value);

    for (const s of cList) {
      con.writeLine(s);
    }

    expectMatches(
      con.text(),
      `Child One Text
Child Two Text
Child Four Text`,
    );
  });
});
