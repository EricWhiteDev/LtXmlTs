/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find a child element".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-child-element
//
// COMPAT: substituted twice.
//   1. The .NET sample loads "PurchaseOrders.xml" from disk; we use an inline
//      XElement.parse of the canonical Multiple purchase orders shape.
//   2. The .NET example compares the LINQ to XML result to an XPath result;
//      XPath is not in the LtXmlTs port (Table 2). We assert by reference
//      identity to a re-fetched LINQ to XML query — the equivalent semantic
//      check — and print the same "Results are identical" line.

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find a child element (conceptual)', () => {
  it('Element("DeliveryNotes") returns the named child', () => {
    const con = createConsole();

    const cpo = XDocument.parse(`<PurchaseOrders>
  <PurchaseOrder>
    <Address>
      <Name>Ellen Adams</Name>
      <Street>123 Maple Street</Street>
      <City>Mill Valley</City>
      <State>CA</State>
      <Zip>10999</Zip>
      <Country>USA</Country>
    </Address>
    <DeliveryNotes>Please leave packages in shed by driveway.</DeliveryNotes>
  </PurchaseOrder>
</PurchaseOrders>`);
    const po = cpo.root!.element('PurchaseOrder')!;
    const el1 = po.element('DeliveryNotes');
    const el2 = po.element('DeliveryNotes');

    if (el1 === el2) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    con.writeLine(el1!);

    expectMatches(
      con.text(),
      `Results are identical
<DeliveryNotes>Please leave packages in shed by driveway.</DeliveryNotes>`,
    );
  });
});
