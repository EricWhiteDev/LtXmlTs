/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to generate XML from CSV files".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/generate-xml-csv-files
//
// COMPAT: the original example writes the CSV to disk then reads it back; we
// keep the data inline (a JS multi-line string) since File.WriteAllText + the
// File.ReadAllLines round trip is incidental to the example's point.

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Generate XML from a CSV file (conceptual)', () => {
  it('split each CSV line, project each into an XElement tree', () => {
    const con = createConsole();

    const csvString = `GREAL,Great Lakes Food Market,Howard Snyder,Marketing Manager,(503) 555-7555,2732 Baker Blvd.,Eugene,OR,97403,USA
HUNGC,Hungry Coyote Import Store,Yoshi Latimer,Sales Representative,(503) 555-6874,City Center Plaza 516 Main St.,Elgin,OR,97827,USA
LAZYK,Lazy K Kountry Store,John Steel,Marketing Manager,(509) 555-7969,12 Orchestra Terrace,Walla Walla,WA,99362,USA
LETSS,Let's Stop N Shop,Jaime Yorres,Owner,(415) 555-5938,87 Polk St. Suite 5,San Francisco,CA,94117,USA`;
    const source = csvString.split('\n');

    const cust = new XElement(
      'Root',
      source.map((line) => {
        const fields = line.split(',');
        return new XElement(
          'Customer',
          new XAttribute('CustomerID', fields[0]),
          new XElement('CompanyName', fields[1]),
          new XElement('ContactName', fields[2]),
          new XElement('ContactTitle', fields[3]),
          new XElement('Phone', fields[4]),
          new XElement(
            'FullAddress',
            new XElement('Address', fields[5]),
            new XElement('City', fields[6]),
            new XElement('Region', fields[7]),
            new XElement('PostalCode', fields[8]),
            new XElement('Country', fields[9]),
          ),
        );
      }),
    );
    con.writeLine(cust);

    expectMatches(
      con.text(),
      `<Root>
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
</Root>`,
    );
  });
});
