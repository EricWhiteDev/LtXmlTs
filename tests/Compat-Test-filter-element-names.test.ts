/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the first C# example from "How to filter on element names".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/filter-element-names
//
// COMPAT: External file PurchaseOrder.xml is substituted with an inline parse.
// The data is synthesized to yield the documented expected output.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Filter on element names (conceptual)', () => {
  it('Descendants(name) yields only matching descendants', () => {
    const con = createConsole();

    const po = XElement.parse(`<PurchaseOrder>
  <Items>
    <Item><ProductName>Lawnmower</ProductName></Item>
    <Item><ProductName>Baby Monitor</ProductName></Item>
  </Items>
</PurchaseOrder>`);

    const items = po.descendants('ProductName');
    for (const prdName of items) {
      con.writeLine(`${prdName.name}:${prdName.value}`);
    }

    expectMatches(
      con.text(),
      `ProductName:Lawnmower
ProductName:Baby Monitor`,
    );
  });
});
