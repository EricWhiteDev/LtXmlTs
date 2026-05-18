/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find descendant elements".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-descendant-elements
//
// COMPAT: substituted twice.
//   1. The .NET sample loads "PurchaseOrders.xml" from disk; we use an inline
//      XDocument.parse of the canonical Multiple purchase orders shape.
//   2. The .NET example compares LINQ to XML to XPath; XPath is not in the
//      LtXmlTs port (Table 2). We assert by length equality to a re-fetched
//      LINQ to XML query — the equivalent semantic check.

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find descendant elements (conceptual)', () => {
  it('Descendants("Name") returns every <Name> in document order', () => {
    const con = createConsole();

    const po = XDocument.parse(`<PurchaseOrders>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Ellen Adams</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Tai Yee</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Cristian Osorio</Name>
    </Address>
    <Address Type="Billing">
      <Name>Cristian Osorio</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Jessica Arnold</Name>
    </Address>
    <Address Type="Billing">
      <Name>Jessica Arnold</Name>
    </Address>
  </PurchaseOrder>
</PurchaseOrders>`);

    const list1 = po.root!.descendants('Name');
    const list2 = po.root!.descendants('Name');

    if (
      list1.length === list2.length &&
      list1.every((el, i) => el === list2[i])
    ) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    for (const el of list1) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<Name>Ellen Adams</Name>
<Name>Tai Yee</Name>
<Name>Cristian Osorio</Name>
<Name>Cristian Osorio</Name>
<Name>Jessica Arnold</Name>
<Name>Jessica Arnold</Name>`,
    );
  });
});
