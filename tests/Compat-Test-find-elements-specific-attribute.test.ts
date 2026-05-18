/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find elements with a specific attribute".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-elements-specific-attribute

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find elements with a specific attribute (regardless of value) (conceptual)', () => {
  it('LINQ where with `el.Attribute("Select") != null` selects only elements that carry the attribute', () => {
    const con = createConsole();

    const doc = XElement.parse(`<Root>
    <Child1>1</Child1>
    <Child2 Select='true'>2</Child2>
    <Child3>3</Child3>
    <Child4 Select='true'>4</Child4>
    <Child5>5</Child5>
</Root>`);

    const list1 = doc.elements().filter((el) => el.attribute('Select') !== null);

    con.writeLine('Results are identical');
    for (const el of list1) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<Child2 Select="true">2</Child2>
<Child4 Select="true">4</Child4>`,
    );
  });
});
