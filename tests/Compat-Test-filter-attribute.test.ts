/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to filter on an attribute".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/filter-attribute
//
// COMPAT: substituted — inline XDocument.parse for "PurchaseOrders.xml", and
// the XPath comparison is replaced with a self-compare of the LINQ to XML
// query (XPath is not in the LtXmlTs port).

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Filter on an attribute (conceptual)', () => {
  it('Descendants("Address").Where(Type=="Shipping") returns Shipping addresses', () => {
    const con = createConsole();

    const po = XDocument.parse(`<PurchaseOrders>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Ellen Adams</Name>
      <Street>123 Maple Street</Street>
      <City>Mill Valley</City>
      <State>CA</State>
      <Zip>10999</Zip>
      <Country>USA</Country>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Billing">
      <Name>Tai Yee</Name>
      <Street>800 Main Street</Street>
      <City>Buffalo</City>
      <State>NY</State>
      <Zip>98112</Zip>
      <Country>USA</Country>
    </Address>
    <Address Type="Shipping">
      <Name>Cristian Osorio</Name>
      <Street>456 Main Street</Street>
      <City>Buffalo</City>
      <State>NY</State>
      <Zip>98112</Zip>
      <Country>USA</Country>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Jessica Arnold</Name>
      <Street>4055 Madison Ave</Street>
      <City>Seattle</City>
      <State>WA</State>
      <Zip>98112</Zip>
      <Country>USA</Country>
    </Address>
  </PurchaseOrder>
</PurchaseOrders>`);

    const list1 = po
      .descendants('Address')
      .filter((el) => el.attribute('Type')!.value === 'Shipping');
    const list2 = po
      .descendants('Address')
      .filter((el) => el.attribute('Type')!.value === 'Shipping');

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
<Address Type="Shipping">
  <Name>Ellen Adams</Name>
  <Street>123 Maple Street</Street>
  <City>Mill Valley</City>
  <State>CA</State>
  <Zip>10999</Zip>
  <Country>USA</Country>
</Address>
<Address Type="Shipping">
  <Name>Cristian Osorio</Name>
  <Street>456 Main Street</Street>
  <City>Buffalo</City>
  <State>NY</State>
  <Zip>98112</Zip>
  <Country>USA</Country>
</Address>
<Address Type="Shipping">
  <Name>Jessica Arnold</Name>
  <Street>4055 Madison Ave</Street>
  <City>Seattle</City>
  <State>WA</State>
  <Zip>98112</Zip>
  <Country>USA</Country>
</Address>`,
    );
  });
});
