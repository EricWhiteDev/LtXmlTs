/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to create hierarchy using grouping".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/create-hierarchy-grouping
//
// COMPAT: substituted — `XElement.Load("Data.xml")` becomes XElement.parse of
// the canonical Numerical data sample; LINQ `group ... by ... into ...` becomes
// `Map<string, XElement[]>` accumulation in declared category order.

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Create hierarchy using grouping (conceptual)', () => {
  it('group Data rows by <Category>, project a Group element per key', () => {
    const con = createConsole();

    const doc = XElement.parse(`<Root>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>24.50</Price></Data>
  <Data><Category>B</Category><Quantity>1</Quantity><Price>89.99</Price></Data>
  <Data><Category>A</Category><Quantity>5</Quantity><Price>4.95</Price></Data>
  <Data><Category>A</Category><Quantity>3</Quantity><Price>66.00</Price></Data>
  <Data><Category>B</Category><Quantity>10</Quantity><Price>.99</Price></Data>
  <Data><Category>A</Category><Quantity>15</Quantity><Price>29.00</Price></Data>
  <Data><Category>B</Category><Quantity>8</Quantity><Price>6.99</Price></Data>
</Root>`);

    const groups = new Map<string, XElement[]>();
    for (const data of doc.elements('Data')) {
      const key = data.element('Category')!.value;
      const bucket = groups.get(key) ?? [];
      bucket.push(data);
      groups.set(key, bucket);
    }

    const newData = new XElement(
      'Root',
      [...groups.entries()].map(
        ([key, items]) =>
          new XElement(
            'Group',
            new XAttribute('ID', key),
            ...items.map(
              (g) =>
                new XElement(
                  'Data',
                  new XElement('Quantity', g.element('Quantity')!.value),
                  new XElement('Price', g.element('Price')!.value),
                ),
            ),
          ),
      ),
    );
    con.writeLine(newData);

    expectMatches(
      con.text(),
      `<Root>
  <Group ID="A">
    <Data>
      <Quantity>3</Quantity>
      <Price>24.50</Price>
    </Data>
    <Data>
      <Quantity>5</Quantity>
      <Price>4.95</Price>
    </Data>
    <Data>
      <Quantity>3</Quantity>
      <Price>66.00</Price>
    </Data>
    <Data>
      <Quantity>15</Quantity>
      <Price>29.00</Price>
    </Data>
  </Group>
  <Group ID="B">
    <Data>
      <Quantity>1</Quantity>
      <Price>89.99</Price>
    </Data>
    <Data>
      <Quantity>10</Quantity>
      <Price>.99</Price>
    </Data>
    <Data>
      <Quantity>8</Quantity>
      <Price>6.99</Price>
    </Data>
  </Group>
</Root>`,
    );
  });
});
