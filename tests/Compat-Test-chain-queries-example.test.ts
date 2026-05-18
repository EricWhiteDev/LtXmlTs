/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the "Chain queries example (C#)" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/chain-queries-example

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Chain queries example (conceptual)', () => {
  // COMPAT: substituted — C# `yield return` → TS generator `function*` + `yield`.
  // The interleaving demonstrates that no intermediate collection is materialized
  // between the two lazy stages; same in the TS port.
  it('two chained generators yield each value through the pipeline one item at a time', () => {
    const con = createConsole();

    function* convertCollectionToUpperCase(
      source: Iterable<string>,
    ): IterableIterator<string> {
      for (const str of source) {
        con.writeLine(`ToUpper: source >${str}<`);
        yield str.toUpperCase();
      }
    }

    function* appendString(
      source: Iterable<string>,
      stringToAppend: string,
    ): IterableIterator<string> {
      for (const str of source) {
        con.writeLine(`AppendString: source >${str}<`);
        yield str + stringToAppend;
      }
    }

    const stringArray = ['abc', 'def', 'ghi'];
    const q1 = convertCollectionToUpperCase(stringArray);
    const q2 = appendString(q1, '!!!');

    for (const str of q2) {
      con.writeLine(`Main: str >${str}<`);
      con.writeLine();
    }

    expectMatches(
      con.text(),
      `ToUpper: source >abc<
AppendString: source >ABC<
Main: str >ABC!!!<

ToUpper: source >def<
AppendString: source >DEF<
Main: str >DEF!!!<

ToUpper: source >ghi<
AppendString: source >GHI<
Main: str >GHI!!!<`,
    );
  });
});
