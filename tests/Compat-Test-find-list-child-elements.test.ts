/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find a list of child elements".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-list-child-elements
//
// COMPAT: substituted — inline XDocument.parse for "PurchaseOrders.xml", and
// the XPath comparison is replaced with a self-compare of the LINQ to XML
// query (XPath is not in the LtXmlTs port).

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find a list of child elements (conceptual)', () => {
  it('Elements() returns every child element of <Address>', () => {
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
  </PurchaseOrder>
</PurchaseOrders>`);

    const po = cpo.root!.element('PurchaseOrder')!.element('Address')!;
    const list1 = po.elements();
    const list2 = po.elements();

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
<Street>123 Maple Street</Street>
<City>Mill Valley</City>
<State>CA</State>
<Zip>10999</Zip>
<Country>USA</Country>`,
    );
  });
});
