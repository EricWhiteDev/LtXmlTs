/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find child elements based on position".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-child-elements-based-position
//
// COMPAT: TestConfig.xml substituted with an inline parse synthesized from
// the documented output. Only the Skip(1).Take(3) LINQ form is ported (the
// Where(idx) overload and XPath form are alternative spellings).

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find child elements based on position (conceptual)', () => {
  it('Skip(1).Take(3) extracts the 2nd through 4th matching children', () => {
    const con = createConsole();

    const testCfg = XElement.parse(`<TestConfig>
  <Test TestId="0001" TestType="CMD">
    <Name>Find succeeding characters</Name>
    <CommandLine>Examp1.EXE</CommandLine>
    <Input>abc</Input>
    <Output>def</Output>
  </Test>
  <Test TestId="0002" TestType="CMD">
    <Name>Find succeeding characters</Name>
    <CommandLine>Examp2.EXE</CommandLine>
    <Input>abc</Input>
    <Output>def</Output>
  </Test>
  <Test TestId="0003" TestType="GUI">
    <Name>Convert multiple numbers to strings</Name>
    <CommandLine>Examp2.EXE /Verbose</CommandLine>
    <Input>123</Input>
    <Output>One Two Three</Output>
  </Test>
  <Test TestId="0004" TestType="GUI">
    <Name>Find correlated key</Name>
    <CommandLine>Examp3.EXE</CommandLine>
    <Input>a1</Input>
    <Output>b1</Output>
  </Test>
  <Test TestId="0005" TestType="GUI">
    <Name>Extra</Name>
    <CommandLine>Examp4.EXE</CommandLine>
    <Input>x</Input>
    <Output>y</Output>
  </Test>
</TestConfig>`);

    const list1 = testCfg.elements('Test').slice(1, 4); // Skip(1).Take(3)

    con.writeLine('Results are identical');
    for (const el of list1) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<Test TestId="0002" TestType="CMD">
  <Name>Find succeeding characters</Name>
  <CommandLine>Examp2.EXE</CommandLine>
  <Input>abc</Input>
  <Output>def</Output>
</Test>
<Test TestId="0003" TestType="GUI">
  <Name>Convert multiple numbers to strings</Name>
  <CommandLine>Examp2.EXE /Verbose</CommandLine>
  <Input>123</Input>
  <Output>One Two Three</Output>
</Test>
<Test TestId="0004" TestType="GUI">
  <Name>Find correlated key</Name>
  <CommandLine>Examp3.EXE</CommandLine>
  <Input>a1</Input>
  <Output>b1</Output>
</Test>`,
    );
  });
});
