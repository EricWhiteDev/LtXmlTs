/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to generate text files from XML".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/generate-text-files-xml
//
// COMPAT: CustomersOrders.xml substituted with an inline parse synthesized
// from the documented expected output. The String.Format + Aggregate combo
// becomes `.map(...).join("")`.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Generate CSV text from XML (conceptual)', () => {
  it('project each Customer XML element to a CSV line', () => {
    const con = createConsole();

    const custOrd = XElement.parse(`<Root>
  <Customers>
    <Customer CustomerID="GREAL">
      <CompanyName>Great Lakes Food Market</CompanyName>
      <ContactName>Howard Snyder</ContactName>
      <ContactTitle>Marketing Manager</ContactTitle>
      <Phone>(503) 555-7555</Phone>
      <FullAddress>
        <Address>2732 Baker Blvd.</Address>
        <City>Eugene</City>
        <Region>OR</Region>
        <PostalCode>97403</PostalCode>
        <Country>USA</Country>
      </FullAddress>
    </Customer>
    <Customer CustomerID="HUNGC">
      <CompanyName>Hungry Coyote Import Store</CompanyName>
      <ContactName>Yoshi Latimer</ContactName>
      <ContactTitle>Sales Representative</ContactTitle>
      <Phone>(503) 555-6874</Phone>
      <FullAddress>
        <Address>City Center Plaza 516 Main St.</Address>
        <City>Elgin</City>
        <Region>OR</Region>
        <PostalCode>97827</PostalCode>
        <Country>USA</Country>
      </FullAddress>
    </Customer>
    <Customer CustomerID="LAZYK">
      <CompanyName>Lazy K Kountry Store</CompanyName>
      <ContactName>John Steel</ContactName>
      <ContactTitle>Marketing Manager</ContactTitle>
      <Phone>(509) 555-7969</Phone>
      <FullAddress>
        <Address>12 Orchestra Terrace</Address>
        <City>Walla Walla</City>
        <Region>WA</Region>
        <PostalCode>99362</PostalCode>
        <Country>USA</Country>
      </FullAddress>
    </Customer>
    <Customer CustomerID="LETSS">
      <CompanyName>Let's Stop N Shop</CompanyName>
      <ContactName>Jaime Yorres</ContactName>
      <ContactTitle>Owner</ContactTitle>
      <Phone>(415) 555-5938</Phone>
      <FullAddress>
        <Address>87 Polk St. Suite 5</Address>
        <City>San Francisco</City>
        <Region>CA</Region>
        <PostalCode>94117</PostalCode>
        <Country>USA</Country>
      </FullAddress>
    </Customer>
  </Customers>
</Root>`);

    const csv = custOrd
      .element('Customers')!
      .elements('Customer')
      .map((el) => {
        const addr = el.element('FullAddress')!;
        return [
          el.attribute('CustomerID')!.value,
          el.element('CompanyName')!.value,
          el.element('ContactName')!.value,
          el.element('ContactTitle')!.value,
          el.element('Phone')!.value,
          addr.element('Address')!.value,
          addr.element('City')!.value,
          addr.element('Region')!.value,
          addr.element('PostalCode')!.value,
          addr.element('Country')!.value,
        ].join(',');
      })
      .join('\n');
    con.writeLine(csv);

    expectMatches(
      con.text(),
      `GREAL,Great Lakes Food Market,Howard Snyder,Marketing Manager,(503) 555-7555,2732 Baker Blvd.,Eugene,OR,97403,USA
HUNGC,Hungry Coyote Import Store,Yoshi Latimer,Sales Representative,(503) 555-6874,City Center Plaza 516 Main St.,Elgin,OR,97827,USA
LAZYK,Lazy K Kountry Store,John Steel,Marketing Manager,(509) 555-7969,12 Orchestra Terrace,Walla Walla,WA,99362,USA
LETSS,Let's Stop N Shop,Jaime Yorres,Owner,(415) 555-5938,87 Polk St. Suite 5,San Francisco,CA,94117,USA`,
    );
  });
});
