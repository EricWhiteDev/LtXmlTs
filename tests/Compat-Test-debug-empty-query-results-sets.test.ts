/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the two C# examples from "How to debug empty query results sets".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/debug-empty-query-results-sets

import { describe, it } from 'vitest';
import { XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

const xmlWithDefaultNamespace = `<Root xmlns='http://www.adventure-works.com'>
    <Child>1</Child>
    <Child>2</Child>
    <Child>3</Child>
    <AnotherChild>4</AnotherChild>
    <AnotherChild>5</AnotherChild>
    <AnotherChild>6</AnotherChild>
</Root>`;

describe('Debug empty query result sets (conceptual)', () => {
  it('querying for "Child" without the namespace returns empty', () => {
    const con = createConsole();

    const root = XElement.parse(xmlWithDefaultNamespace);
    const c1 = root.elements('Child');

    con.writeLine('Result set follows:');
    for (const el of c1) {
      con.writeLine(Number(el.value));
    }
    con.writeLine('End of result set');

    expectMatches(
      con.text(),
      `Result set follows:
End of result set`,
    );
  });

  it('querying with the namespace returns the matching elements', () => {
    const con = createConsole();

    const root = XElement.parse(xmlWithDefaultNamespace);
    const aw = XNamespace.get('http://www.adventure-works.com');
    const c1 = root.elements(aw + 'Child');

    con.writeLine('Result set follows:');
    for (const el of c1) {
      con.writeLine(Number(el.value));
    }
    con.writeLine('End of result set');

    expectMatches(
      con.text(),
      `Result set follows:
1
2
3
End of result set`,
    );
  });
});
