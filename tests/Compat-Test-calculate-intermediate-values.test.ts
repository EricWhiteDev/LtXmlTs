/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the first C# example from "How to calculate intermediate values".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/calculate-intermediate-values
//
// COMPAT: substituted — `XElement.Load("Data.xml")` → `XElement.parse(...)`,
// `(decimal)` → `Number(...)`, `let extension` → `.map(...)`, `orderby` →
// `.sort()`.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Calculate intermediate values (conceptual)', () => {
  it('compute Quantity*Price per Data row, filter >= 25, sort ascending', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>24.50</Price></Data>
  <Data><Category>B</Category><Quantity>1</Quantity><Price>89.99</Price></Data>
  <Data><Category>A</Category><Quantity>5</Quantity><Price>4.95</Price></Data>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>66.00</Price></Data>
  <Data><Category>B</Category><Quantity>10</Quantity><Price>.99</Price></Data>
  <Data><Category>A</Category><Quantity>15</Quantity><Price>29.00</Price></Data>
  <Data><Category>B</Category><Quantity>8</Quantity><Price>6.99</Price></Data>
</Root>`);

    const extensions = root
      .elements('Data')
      .map((el) => Number(el.element('Quantity')!.value) * Number(el.element('Price')!.value))
      .filter((extension) => extension >= 25)
      .sort((a, b) => a - b);

    for (const ex of extensions) {
      // The .NET decimal type prints trailing zeros canonically; we match by
      // hand-formatting each computed value.
      con.writeLine(ex.toFixed(2));
    }

    expectMatches(
      con.text(),
      `55.92
73.50
89.99
198.00
435.00`,
    );
  });
});
