/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to control the type of a projection".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/control-type-projection
//
// COMPAT: CustomersOrders.xml substituted with an inline parse whose data
// yields the documented expected output.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

class Customer {
  constructor(
    public readonly customerID: string,
    public readonly companyName: string,
    public readonly contactName: string,
  ) {}
  toString(): string {
    return `${this.customerID}:${this.companyName}:${this.contactName}`;
  }
}

describe('Control the type of a projection (conceptual)', () => {
  it('Select projects each matching XML node into an instance of a user-defined class', () => {
    const con = createConsole();

    const custOrd = XElement.parse(`<Root>
  <Customers>
    <Customer CustomerID="GREAL"><CompanyName>Great Lakes Food Market</CompanyName><ContactName>Howard Snyder</ContactName></Customer>
    <Customer CustomerID="HUNGC"><CompanyName>Hungry Coyote Import Store</CompanyName><ContactName>Yoshi Latimer</ContactName></Customer>
    <Customer CustomerID="LAZYK"><CompanyName>Lazy K Kountry Store</CompanyName><ContactName>John Steel</ContactName></Customer>
    <Customer CustomerID="LETSS"><CompanyName>Let's Stop N Shop</CompanyName><ContactName>Jaime Yorres</ContactName></Customer>
  </Customers>
</Root>`);

    const custList = custOrd
      .element('Customers')!
      .elements('Customer')
      .map(
        (el) =>
          new Customer(
            el.attribute('CustomerID')!.value,
            el.element('CompanyName')!.value,
            el.element('ContactName')!.value,
          ),
      );
    for (const cust of custList) {
      con.writeLine(cust.toString());
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
