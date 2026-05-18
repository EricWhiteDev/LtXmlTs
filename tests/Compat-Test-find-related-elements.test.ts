/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find related elements".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-related-elements
//
// COMPAT: substituted — inline XDocument.parse for "CustomersOrders.xml" with
// just enough shape (one HUNGC customer + 12 Orders, 12th with CustomerID
// "HUNGC") to exercise the query. The XPath comparison is dropped (XPath is
// not in the LtXmlTs port); we self-compare the two LINQ to XML phrasings
// (.ToList()[11] vs .Skip(11).First()).

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find related elements (conceptual)', () => {
  it('look up the Customer whose ID matches the 12th Order.CustomerID', () => {
    const con = createConsole();

    const orderBlock = Array.from({ length: 11 }, (_, i) => {
      const id = `ID${(i + 1).toString().padStart(2, '0')}`;
      return `    <Order><CustomerID>${id}</CustomerID></Order>`;
    }).join('\n');

    const co = XDocument.parse(`<Root>
  <Customers>
    <Customer CustomerID="HUNGC">
      <CompanyName>Hungry Coyote Import Store</CompanyName>
      <ContactName>Yoshi Latimer</ContactName>
      <ContactTitle>Sales Representative</ContactTitle>
      <Phone>(503) 555-6874</Phone>
      <Fax>(503) 555-2376</Fax>
      <FullAddress>
        <Address>City Center Plaza 516 Main St.</Address>
        <City>Elgin</City>
        <Region>OR</Region>
        <PostalCode>97827</PostalCode>
        <Country>USA</Country>
      </FullAddress>
    </Customer>
  </Customers>
  <Orders>
${orderBlock}
    <Order><CustomerID>HUNGC</CustomerID></Order>
  </Orders>
</Root>`);

    const list = co.descendants('Customer');
    const orders = co.element('Root')!.element('Orders')!.elements('Order');

    const target1 = [...orders][11].element('CustomerID')!.value;
    const customer1 = list.filter((el) => el.attribute('CustomerID')!.value === target1)[0]!;

    const target2 = orders.slice(11)[0]!.element('CustomerID')!.value;
    const customer2 = list.filter((el) => el.attribute('CustomerID')!.value === target2)[0]!;

    if (customer1 === customer2) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    con.writeLine(customer1);

    expectMatches(
      con.text(),
      `Results are identical
<Customer CustomerID="HUNGC">
  <CompanyName>Hungry Coyote Import Store</CompanyName>
  <ContactName>Yoshi Latimer</ContactName>
  <ContactTitle>Sales Representative</ContactTitle>
  <Phone>(503) 555-6874</Phone>
  <Fax>(503) 555-2376</Fax>
  <FullAddress>
    <Address>City Center Plaza 516 Main St.</Address>
    <City>Elgin</City>
    <Region>OR</Region>
    <PostalCode>97827</PostalCode>
    <Country>USA</Country>
  </FullAddress>
</Customer>`,
    );
  });
});
