/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the "Deferred execution example" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-example

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Deferred execution example (conceptual)', () => {
  // COMPAT: substituted — C# `yield return` in an extension method becomes
  // a TypeScript generator function (`function*` + `yield`). The interleaved
  // execution order between source-iteration and consumer-iteration is the
  // semantic point of the example, and is preserved.
  it('a lazy generator interleaves "source X" prints with consumer "str Y" prints', () => {
    const con = createConsole();

    function* convertCollectionToUpperCase(source: Iterable<string>): IterableIterator<string> {
      for (const str of source) {
        con.writeLine(`ToUpper: source ${str}`);
        yield str.toUpperCase();
      }
    }

    const stringArray = ['abc', 'def', 'ghi'];
    const q = convertCollectionToUpperCase(stringArray);
    for (const str of q) {
      con.writeLine(`Main: str ${str}`);
    }

    expectMatches(
      con.text(),
      `ToUpper: source abc
Main: str ABC
ToUpper: source def
Main: str DEF
ToUpper: source ghi
Main: str GHI`,
    );
  });
});
