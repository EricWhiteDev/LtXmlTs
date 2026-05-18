/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find an element with a specific child element".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-element-specific-child-element
//
// COMPAT: External TestConfig.xml substituted with an inline parse whose
// data yields the documented expected output ("0002\n0006").

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find an element with a specific child element (conceptual)', () => {
  it('LINQ where filter on a child element value selects matching parent elements', () => {
    const con = createConsole();

    const root = XElement.parse(`<TestConfig>
  <Test TestId="0001"><CommandLine>Examp1.EXE</CommandLine></Test>
  <Test TestId="0002"><CommandLine>Examp2.EXE</CommandLine></Test>
  <Test TestId="0003"><CommandLine>Examp1.EXE</CommandLine></Test>
  <Test TestId="0006"><CommandLine>Examp2.EXE</CommandLine></Test>
</TestConfig>`);

    const tests = root
      .elements('Test')
      .filter((el) => el.element('CommandLine')?.value === 'Examp2.EXE');
    for (const el of tests) {
      con.writeLine(el.attribute('TestId')!.value);
    }

    expectMatches(con.text(), `0002\n0006`);
  });
});
