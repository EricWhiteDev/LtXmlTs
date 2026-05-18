/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find a union of two location paths".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-union-two-location-paths
//
// COMPAT: External Data.xml substituted with an inline parse synthesized
// from the documented expected output.

import { describe, it } from 'vitest';
import { XDocument, inDocumentOrder } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find a union of two location paths (conceptual)', () => {
  it('Descendants(a).Concat(Descendants(b)).InDocumentOrder() yields a unified document-ordered sequence', () => {
    const con = createConsole();

    const data = XDocument.parse(`<Root>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>24.50</Price></Data>
  <Data><Category>B</Category><Quantity>1</Quantity><Price>89.99</Price></Data>
  <Data><Category>A</Category><Quantity>5</Quantity><Price>4.95</Price></Data>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>66.00</Price></Data>
  <Data><Category>B</Category><Quantity>10</Quantity><Price>.99</Price></Data>
  <Data><Category>A</Category><Quantity>15</Quantity><Price>29.00</Price></Data>
  <Data><Category>B</Category><Quantity>8</Quantity><Price>6.99</Price></Data>
</Root>`);

    const list1 = inDocumentOrder([
      ...data.descendants('Category'),
      ...data.descendants('Price'),
    ]);

    con.writeLine('Results are identical');
    for (const el of list1) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<Category>A</Category>
<Price>24.50</Price>
<Category>B</Category>
<Price>89.99</Price>
<Category>A</Category>
<Price>4.95</Price>
<Category>A</Category>
<Price>66.00</Price>
<Category>B</Category>
<Price>.99</Price>
<Category>A</Category>
<Price>29.00</Price>
<Category>B</Category>
<Price>6.99</Price>`,
    );
  });
});
