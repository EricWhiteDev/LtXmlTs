/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the two C# examples from "Maintain name-value pairs".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/maintain-name-value-pairs

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Maintain name-value pairs (conceptual)', () => {
  // COMPAT: TS `setAttributeValue` requires `string | null`; we pre-stringify
  // integer values to match the documented output ("22", "20", etc.).
  it('SetAttributeValue: add, update, remove an attribute by value or null', () => {
    const con = createConsole();

    const root = new XElement('Root');
    root.setAttributeValue('Top', '22');
    root.setAttributeValue('Left', '20');
    root.setAttributeValue('Bottom', '122');
    root.setAttributeValue('Right', '300');
    root.setAttributeValue('DefaultColor', 'Color.Red');
    con.writeLine(root);

    root.setAttributeValue('Top', '10');
    con.writeLine(root);

    root.setAttributeValue('DefaultColor', null);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root Top="22" Left="20" Bottom="122" Right="300" DefaultColor="Color.Red" />
<Root Top="10" Left="20" Bottom="122" Right="300" DefaultColor="Color.Red" />
<Root Top="10" Left="20" Bottom="122" Right="300" />`,
    );
  });

  // COMPAT: same — pre-stringify integers for setElementValue's string|null arg.
  it('SetElementValue: add, update, remove a child element by value or null', () => {
    const con = createConsole();

    const root = new XElement('Root');
    root.setElementValue('Top', '22');
    root.setElementValue('Left', '20');
    root.setElementValue('Bottom', '122');
    root.setElementValue('Right', '300');
    root.setElementValue('DefaultColor', 'Color.Red');
    con.writeLine(root);
    con.writeLine('----');

    root.setElementValue('Top', '10');
    con.writeLine(root);
    con.writeLine('----');

    root.setElementValue('DefaultColor', null);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Top>22</Top>
  <Left>20</Left>
  <Bottom>122</Bottom>
  <Right>300</Right>
  <DefaultColor>Color.Red</DefaultColor>
</Root>
----
<Root>
  <Top>10</Top>
  <Left>20</Left>
  <Bottom>122</Bottom>
  <Right>300</Right>
  <DefaultColor>Color.Red</DefaultColor>
</Root>
----
<Root>
  <Top>10</Top>
  <Left>20</Left>
  <Bottom>122</Bottom>
  <Right>300</Right>
</Root>`,
    );
  });
});
