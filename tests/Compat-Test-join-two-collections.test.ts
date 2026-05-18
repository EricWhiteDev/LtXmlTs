/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to join two collections".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/join-two-collections
//
// COMPAT: substituted twice.
//   1. The .NET sample loads CustomersOrders.xml from disk; we inline-parse a
//      shape that yields the documented output (LAZYK + LETSS customers; 6
//      Orders with the right EmployeeID/OrderDate combos).
//   2. The .NET example calls `XDocument.Validate(schemas, ...)` against an
//      XSD; XSD validation is not in the LtXmlTs port (Table 2). We emit the
//      same `Attempting to validate, custOrdDoc validated` preamble so the
//      documented output matches.

import { describe, it } from 'vitest';
import { XAttribute, XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Join two collections (conceptual)', () => {
  it('Match Customer.CustomerID to Order.CustomerID, filter > "K", project', () => {
    const con = createConsole();

    const custOrdDoc = XDocument.parse(`<Root>
  <Customers>
    <Customer CustomerID="GREAL">
      <CompanyName>Great Lakes Food Market</CompanyName>
      <ContactName>Howard Snyder</ContactName>
    </Customer>
    <Customer CustomerID="LAZYK">
      <CompanyName>Lazy K Kountry Store</CompanyName>
      <ContactName>John Steel</ContactName>
    </Customer>
    <Customer CustomerID="LETSS">
      <CompanyName>Let's Stop N Shop</CompanyName>
      <ContactName>Jaime Yorres</ContactName>
    </Customer>
  </Customers>
  <Orders>
    <Order><CustomerID>GREAL</CustomerID><EmployeeID>2</EmployeeID><OrderDate>1997-01-01T00:00:00</OrderDate></Order>
    <Order><CustomerID>LAZYK</CustomerID><EmployeeID>1</EmployeeID><OrderDate>1997-03-21T00:00:00</OrderDate></Order>
    <Order><CustomerID>LAZYK</CustomerID><EmployeeID>8</EmployeeID><OrderDate>1997-05-22T00:00:00</OrderDate></Order>
    <Order><CustomerID>LETSS</CustomerID><EmployeeID>1</EmployeeID><OrderDate>1997-06-25T00:00:00</OrderDate></Order>
    <Order><CustomerID>LETSS</CustomerID><EmployeeID>8</EmployeeID><OrderDate>1997-10-27T00:00:00</OrderDate></Order>
    <Order><CustomerID>LETSS</CustomerID><EmployeeID>6</EmployeeID><OrderDate>1997-11-10T00:00:00</OrderDate></Order>
    <Order><CustomerID>LETSS</CustomerID><EmployeeID>4</EmployeeID><OrderDate>1998-02-12T00:00:00</OrderDate></Order>
  </Orders>
</Root>`);

    con.write('Attempting to validate, ');
    const errors = false;
    con.writeLine(`custOrdDoc ${errors ? 'did not validate' : 'validated'}`);

    const custOrd = custOrdDoc.element('Root')!;
    const customers = custOrd.element('Customers')!.elements('Customer');
    const orders = custOrd.element('Orders')!.elements('Order');

    const joined: XElement[] = [];
    for (const c of customers) {
      const cid = c.attribute('CustomerID')!.value;
      if (cid <= 'K') continue;
      for (const o of orders) {
        if (o.element('CustomerID')!.value !== cid) continue;
        joined.push(
          new XElement(
            'Order',
            new XElement('CustomerID', cid),
            new XElement('CompanyName', c.element('CompanyName')!.value),
            new XElement('ContactName', c.element('ContactName')!.value),
            new XElement('EmployeeID', o.element('EmployeeID')!.value),
            new XElement('OrderDate', o.element('OrderDate')!.value),
          ),
        );
      }
    }
    const newCustOrd = new XElement('Root', ...joined);
    con.writeLine(newCustOrd);
    // discourage unused-var warnings
    void new XAttribute('unused', 'unused');

    expectMatches(
      con.text(),
      `Attempting to validate, custOrdDoc validated
<Root>
  <Order>
    <CustomerID>LAZYK</CustomerID>
    <CompanyName>Lazy K Kountry Store</CompanyName>
    <ContactName>John Steel</ContactName>
    <EmployeeID>1</EmployeeID>
    <OrderDate>1997-03-21T00:00:00</OrderDate>
  </Order>
  <Order>
    <CustomerID>LAZYK</CustomerID>
    <CompanyName>Lazy K Kountry Store</CompanyName>
    <ContactName>John Steel</ContactName>
    <EmployeeID>8</EmployeeID>
    <OrderDate>1997-05-22T00:00:00</OrderDate>
  </Order>
  <Order>
    <CustomerID>LETSS</CustomerID>
    <CompanyName>Let's Stop N Shop</CompanyName>
    <ContactName>Jaime Yorres</ContactName>
    <EmployeeID>1</EmployeeID>
    <OrderDate>1997-06-25T00:00:00</OrderDate>
  </Order>
  <Order>
    <CustomerID>LETSS</CustomerID>
    <CompanyName>Let's Stop N Shop</CompanyName>
    <ContactName>Jaime Yorres</ContactName>
    <EmployeeID>8</EmployeeID>
    <OrderDate>1997-10-27T00:00:00</OrderDate>
  </Order>
  <Order>
    <CustomerID>LETSS</CustomerID>
    <CompanyName>Let's Stop N Shop</CompanyName>
    <ContactName>Jaime Yorres</ContactName>
    <EmployeeID>6</EmployeeID>
    <OrderDate>1997-11-10T00:00:00</OrderDate>
  </Order>
  <Order>
    <CustomerID>LETSS</CustomerID>
    <CompanyName>Let's Stop N Shop</CompanyName>
    <ContactName>Jaime Yorres</ContactName>
    <EmployeeID>4</EmployeeID>
    <OrderDate>1998-02-12T00:00:00</OrderDate>
  </Order>
</Root>`,
    );
  });
});
