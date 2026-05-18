/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to project an object graph".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/project-object-graph
//
// COMPAT: substituted —
//   * `XElement.Load("PurchaseOrder.xml")` becomes XElement.parse of the
//     canonical Typical purchase order sample.
//   * The .NET `{:d}` short-date format is locale-dependent; we hard-format
//     dates as "M/d/YYYY" (US short date) to match the documented expected
//     output exactly.
//   * `(int)el`, `(string)el`, `(Decimal)el`, `(DateTime)el` cast operators
//     become `Number(el.value)`, `el.value`, `el.value`, `el.value`
//     respectively (the example's USPrice is printed verbatim from the XML).

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

enum AddressUse {
  Shipping,
  Billing,
}

interface AddressData {
  addressType: AddressUse;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ItemData {
  partNumber: string;
  productName: string;
  quantity: number;
  usPrice: string;
  comment?: string;
  shipDate?: string;
}

interface PurchaseOrderData {
  purchaseOrderNumber: string;
  orderDate: string;
  addresses: AddressData[];
  items: ItemData[];
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${m}/${d}/${y}`;
}

function addressString(a: AddressData): string {
  return [
    `Type: ${a.addressType === AddressUse.Shipping ? 'Shipping' : 'Billing'}`,
    `Name: ${a.name}`,
    `Street: ${a.street}`,
    `City: ${a.city}`,
    `State: ${a.state}`,
    `Zip: ${a.zip}`,
    `Country: ${a.country}`,
    '',
  ].join('\n');
}

function itemString(i: ItemData): string {
  const lines = [
    `PartNumber: ${i.partNumber}`,
    `ProductName: ${i.productName}`,
    `Quantity: ${i.quantity}`,
    `USPrice: ${i.usPrice}`,
  ];
  if (i.comment !== undefined) lines.push(`Comment: ${i.comment}`);
  if (i.shipDate !== undefined) lines.push(`ShipDate: ${shortDate(i.shipDate)}`);
  lines.push('');
  return lines.join('\n');
}

function purchaseOrderString(po: PurchaseOrderData): string {
  const sb: string[] = [];
  sb.push(`PurchaseOrderNumber: ${po.purchaseOrderNumber}`);
  sb.push(`OrderDate: ${shortDate(po.orderDate)}`);
  sb.push('');
  sb.push('Addresses');
  sb.push('=====');
  for (const a of po.addresses) sb.push(addressString(a));
  sb.push('Items');
  sb.push('=====');
  for (const i of po.items) sb.push(itemString(i));
  return sb.join('\n');
}

describe('Project an object graph (conceptual)', () => {
  it('populate PurchaseOrder/Address/PurchaseOrderItem instances from XML', () => {
    const con = createConsole();

    const po = XElement.parse(`<PurchaseOrder PurchaseOrderNumber="99503" OrderDate="1999-10-20">
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
  <Items>
    <Item PartNumber="872-AA">
      <ProductName>Lawnmower</ProductName>
      <Quantity>1</Quantity>
      <USPrice>148.95</USPrice>
      <Comment>Confirm this is electric</Comment>
    </Item>
    <Item PartNumber="926-AA">
      <ProductName>Baby Monitor</ProductName>
      <Quantity>2</Quantity>
      <USPrice>39.98</USPrice>
      <ShipDate>1999-05-21</ShipDate>
    </Item>
  </Items>
</PurchaseOrder>`);

    const purchaseOrder: PurchaseOrderData = {
      purchaseOrderNumber: po.attribute('PurchaseOrderNumber')!.value,
      orderDate: po.attribute('OrderDate')!.value,
      addresses: po.elements('Address').map((a) => ({
        addressType:
          a.attribute('Type')!.value === 'Shipping'
            ? AddressUse.Shipping
            : AddressUse.Billing,
        name: a.element('Name')!.value,
        street: a.element('Street')!.value,
        city: a.element('City')!.value,
        state: a.element('State')!.value,
        zip: a.element('Zip')!.value,
        country: a.element('Country')!.value,
      })),
      items: po.element('Items')!.elements('Item').map((i) => ({
        partNumber: i.attribute('PartNumber')!.value,
        productName: i.element('ProductName')!.value,
        quantity: Number(i.element('Quantity')!.value),
        usPrice: i.element('USPrice')!.value,
        comment: i.element('Comment')?.value,
        shipDate: i.element('ShipDate')?.value,
      })),
    };
    con.writeLine(purchaseOrderString(purchaseOrder));

    expectMatches(
      con.text(),
      `PurchaseOrderNumber: 99503
OrderDate: 10/20/1999

Addresses
=====
Type: Shipping
Name: Ellen Adams
Street: 123 Maple Street
City: Mill Valley
State: CA
Zip: 10999
Country: USA

Type: Billing
Name: Tai Yee
Street: 8 Oak Avenue
City: Old Town
State: PA
Zip: 95819
Country: USA

Items
=====
PartNumber: 872-AA
ProductName: Lawnmower
Quantity: 1
USPrice: 148.95
Comment: Confirm this is electric

PartNumber: 926-AA
ProductName: Baby Monitor
Quantity: 2
USPrice: 39.98
ShipDate: 5/21/1999`,
    );
  });
});
