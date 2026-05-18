/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the first C# example from "How to find an element with a specific attribute".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-element-specific-attribute
//
// COMPAT: External PurchaseOrder.xml substituted with an inline parse whose
// data yields the documented expected output.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

const purchaseOrderXml = `<PurchaseOrder>
  <Address Type="Shipping">
    <Name>Ellen Adams</Name>
    <Street>123 Maple Street</Street>
    <City>Mill Valley</City>
    <State>CA</State>
    <Zip>10999</Zip>
    <Country>USA</Country>
  </Address>
  <Address Type="Billing">
    <Name>Tai Yee</Name>
    <Street>8 Oak Avenue</Street>
    <City>Old Town</City>
    <State>PA</State>
    <Zip>95819</Zip>
    <Country>USA</Country>
  </Address>
</PurchaseOrder>`;

describe('Find an element with a specific attribute (conceptual)', () => {
  it('LINQ-style where filter on an attribute value selects the matching element', () => {
    const con = createConsole();

    const root = XElement.parse(purchaseOrderXml);
    const address = root
      .elements('Address')
      .filter((el) => el.attribute('Type')?.value === 'Billing');
    for (const el of address) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `<Address Type="Billing">
  <Name>Tai Yee</Name>
  <Street>8 Oak Avenue</Street>
  <City>Old Town</City>
  <State>PA</State>
  <Zip>95819</Zip>
  <Country>USA</Country>
</Address>`,
    );
  });
});
