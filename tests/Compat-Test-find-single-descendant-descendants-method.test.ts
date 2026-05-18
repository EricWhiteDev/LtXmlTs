/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from
// "How to find a single descendant using the Descendants method".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-single-descendant-descendants-method

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find a single descendant via Descendants (conceptual)', () => {
  // COMPAT: substituted — `(string)(query).First()` → `query[0].value`.
  it('Descendants(name) + First selects the lone matching descendant', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
  <Child1><GrandChild1>GC1 Value</GrandChild1></Child1>
  <Child2><GrandChild2>GC2 Value</GrandChild2></Child2>
  <Child3><GrandChild3>GC3 Value</GrandChild3></Child3>
  <Child4><GrandChild4>GC4 Value</GrandChild4></Child4>
</Root>`);
    const grandChild3 = root.descendants('GrandChild3')[0].value;
    con.writeLine(grandChild3);

    expectMatches(con.text(), `GC3 Value`);
  });
});
