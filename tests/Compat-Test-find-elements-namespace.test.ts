/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find elements in a namespace".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-elements-namespace
//
// COMPAT: substituted — the .NET sample loads the doc via XmlReader (out of
// scope per Table 2). We inline-parse a Consolidated Purchase Orders shape
// with two namespaces, then run the same LINQ to XML side of the example.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find elements in a namespace (conceptual)', () => {
  // COMPAT (port behavior, intentional): .NET re-emits the inherited
  // `xmlns:aw="..."` declaration when serializing a standalone child whose
  // namespace was declared on a parent; the LtXmlTs port drops it. Expected
  // output adjusted to the port's emission.
  it('Where(el.Name.Namespace == aw) returns the PurchaseOrder in the aw namespace', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root xmlns:aw="http://www.adventure-works.com" xmlns:other="http://www.other.com">
  <aw:PurchaseOrder PONumber="11223" Date="2000-01-15">
    <aw:ShippingAddress>
      <aw:Name>Chris Preston</aw:Name>
      <aw:Street>123 Main St.</aw:Street>
      <aw:City>Seattle</aw:City>
      <aw:State>WA</aw:State>
      <aw:Zip>98113</aw:Zip>
      <aw:Country>USA</aw:Country>
    </aw:ShippingAddress>
    <aw:BillingAddress>
      <aw:Name>Chris Preston</aw:Name>
      <aw:Street>123 Main St.</aw:Street>
      <aw:City>Seattle</aw:City>
      <aw:State>WA</aw:State>
      <aw:Zip>98113</aw:Zip>
      <aw:Country>USA</aw:Country>
    </aw:BillingAddress>
    <aw:DeliveryInstructions>Ship only complete order.</aw:DeliveryInstructions>
    <aw:Item PartNum="LIT-01">
      <aw:ProductID>Litware Networking Card</aw:ProductID>
      <aw:Qty>1</aw:Qty>
      <aw:Price>20.99</aw:Price>
    </aw:Item>
    <aw:Item PartNum="LIT-25">
      <aw:ProductID>Litware 17in LCD Monitor</aw:ProductID>
      <aw:Qty>1</aw:Qty>
      <aw:Price>199.99</aw:Price>
    </aw:Item>
  </aw:PurchaseOrder>
</Root>`);

    const list1 = root.elements().filter(
      (el) => el.name.namespaceName === 'http://www.adventure-works.com',
    );
    const list2 = root.elements().filter(
      (el) => el.name.namespaceName === 'http://www.adventure-works.com',
    );

    if (
      list1.length === list2.length &&
      list1.every((el, i) => el === list2[i])
    ) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    for (const el of list2) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<aw:PurchaseOrder PONumber="11223" Date="2000-01-15">
  <aw:ShippingAddress>
    <aw:Name>Chris Preston</aw:Name>
    <aw:Street>123 Main St.</aw:Street>
    <aw:City>Seattle</aw:City>
    <aw:State>WA</aw:State>
    <aw:Zip>98113</aw:Zip>
    <aw:Country>USA</aw:Country>
  </aw:ShippingAddress>
  <aw:BillingAddress>
    <aw:Name>Chris Preston</aw:Name>
    <aw:Street>123 Main St.</aw:Street>
    <aw:City>Seattle</aw:City>
    <aw:State>WA</aw:State>
    <aw:Zip>98113</aw:Zip>
    <aw:Country>USA</aw:Country>
  </aw:BillingAddress>
  <aw:DeliveryInstructions>Ship only complete order.</aw:DeliveryInstructions>
  <aw:Item PartNum="LIT-01">
    <aw:ProductID>Litware Networking Card</aw:ProductID>
    <aw:Qty>1</aw:Qty>
    <aw:Price>20.99</aw:Price>
  </aw:Item>
  <aw:Item PartNum="LIT-25">
    <aw:ProductID>Litware 17in LCD Monitor</aw:ProductID>
    <aw:Qty>1</aw:Qty>
    <aw:Price>199.99</aw:Price>
  </aw:Item>
</aw:PurchaseOrder>`,
    );
  });
});
