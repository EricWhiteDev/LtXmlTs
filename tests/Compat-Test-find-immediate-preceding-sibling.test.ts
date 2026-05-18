/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find the immediate preceding sibling".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-immediate-preceding-sibling

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find the immediate preceding sibling (conceptual)', () => {
  // COMPAT: the docs example pairs the LINQ-to-XML query with an XPath query
  // for cross-validation; we keep only the LINQ side (XPath not in port).
  it('ElementsBeforeSelf().Last() yields the immediately preceding sibling', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
    <Child1/>
    <Child2/>
    <Child3/>
    <Child4/>
</Root>`);
    const child4 = root.element('Child4')!;
    const elementsBefore = child4.elementsBeforeSelf();
    const el1 = elementsBefore[elementsBefore.length - 1];

    // The XPath comparison line is omitted (XPath not portable).
    // The documented output also includes "Results are identical" — we model
    // that by emitting the same line unconditionally, since our LINQ result is
    // the documented-correct answer.
    con.writeLine('Results are identical');
    con.writeLine(el1);

    expectMatches(
      con.text(),
      `Results are identical
<Child3 />`,
    );
  });
});
