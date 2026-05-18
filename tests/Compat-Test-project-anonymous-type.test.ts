/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to project an anonymous type".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/project-anonymous-type
//
// COMPAT: The original example loads CustomersOrders.xml (a "Sample XML file:
// Customers and orders" linked from the docs). We substitute an inline XML
// string whose data matches the documented expected output line-for-line.
// The point of the example — projecting from XML query result into an
// anonymous (in TS: object-literal) type — is preserved.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Project an anonymous type (conceptual)', () => {
  it('projects XML query results into an anonymous-type-equivalent object literal', () => {
    const con = createConsole();

    const custOrd = XElement.parse(`<Root>
  <Customers>
    <Customer CustomerID="GREAL">
      <CompanyName>Great Lakes Food Market</CompanyName>
      <ContactName>Howard Snyder</ContactName>
    </Customer>
    <Customer CustomerID="HUNGC">
      <CompanyName>Hungry Coyote Import Store</CompanyName>
      <ContactName>Yoshi Latimer</ContactName>
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
</Root>`);

    const custList = custOrd
      .element('Customers')!
      .elements('Customer')
      .map((el) => ({
        CustomerID: el.attribute('CustomerID')?.value ?? '',
        CompanyName: el.element('CompanyName')?.value ?? '',
        ContactName: el.element('ContactName')?.value ?? '',
      }));

    for (const cust of custList) {
      con.writeLine(`${cust.CustomerID}:${cust.CompanyName}:${cust.ContactName}`);
    }

    expectMatches(
      con.text(),
      `GREAL:Great Lakes Food Market:Howard Snyder
HUNGC:Hungry Coyote Import Store:Yoshi Latimer
LAZYK:Lazy K Kountry Store:John Steel
LETSS:Let's Stop N Shop:Jaime Yorres`,
    );
  });
});
