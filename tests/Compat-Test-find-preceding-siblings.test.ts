/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find preceding siblings".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-preceding-siblings
//
// COMPAT: substituted — inline XElement.parse for "CustomersOrders.xml", and
// the XPath preceding-sibling axis is replaced with a self-compare of
// ElementsBeforeSelf (XPath is not in the LtXmlTs port).

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find preceding siblings (conceptual)', () => {
  it('XNode.ElementsBeforeSelf returns the four siblings preceding <FullAddress>', () => {
    const con = createConsole();

    const co = XElement.parse(`<Root>
  <Customers>
    <Customer CustomerID="GREAL">
      <CompanyName>Great Lakes Food Market</CompanyName>
      <ContactName>Howard Snyder</ContactName>
      <ContactTitle>Marketing Manager</ContactTitle>
      <Phone>(503) 555-7555</Phone>
      <FullAddress>
        <Address>2732 Baker Blvd.</Address>
      </FullAddress>
    </Customer>
  </Customers>
</Root>`);

    const add = co.element('Customers')!.element('Customer')!.element('FullAddress')!;
    const list1 = add.elementsBeforeSelf();
    const list2 = add.elementsBeforeSelf();

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
<CompanyName>Great Lakes Food Market</CompanyName>
<ContactName>Howard Snyder</ContactName>
<ContactTitle>Marketing Manager</ContactTitle>
<Phone>(503) 555-7555</Phone>`,
    );
  });
});
