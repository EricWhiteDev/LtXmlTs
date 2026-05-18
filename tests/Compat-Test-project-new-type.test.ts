/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to project a new type".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/project-new-type
//
// COMPAT: The original example loads PurchaseOrder.xml. We substitute an
// inline XML literal whose data yields the documented expected output.
// Cast `(int)n.Element("Quantity")` → `Number(n.element('Quantity')!.value)`.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

class NameQty {
  constructor(public readonly name: string, public readonly qty: number) {}
}

describe('Project a new (named) type (conceptual)', () => {
  it('projects XML query results into instances of a user-defined class', () => {
    const con = createConsole();

    const po = XElement.parse(`<PurchaseOrder>
  <Items>
    <Item>
      <ProductName>Lawnmower</ProductName>
      <Quantity>1</Quantity>
    </Item>
    <Item>
      <ProductName>Baby Monitor</ProductName>
      <Quantity>2</Quantity>
    </Item>
  </Items>
</PurchaseOrder>`);

    const nqList = po
      .descendants('Item')
      .map(
        (n) =>
          new NameQty(
            n.element('ProductName')!.value,
            Number(n.element('Quantity')!.value),
          ),
      );

    for (const n of nqList) {
      con.writeLine(`${n.name}:${n.qty}`);
    }

    expectMatches(
      con.text(),
      `Lawnmower:1
Baby Monitor:2`,
    );
  });
});
