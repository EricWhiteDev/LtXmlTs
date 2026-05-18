/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the "Chain standard query operators together (C#)" article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/chain-standard-query-operators-together

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Chain standard query operators together (conceptual)', () => {
  // COMPAT: substituted — C# `yield return` → TS `function*` + `yield`;
  // C# `where s.CompareTo("D") >= 0` → JS `s >= 'D'` lexicographic comparison.
  // The point of the example is that the where-filter participates in lazy
  // evaluation; that semantic is preserved.
  it('a Where filter interleaved between two lazy stages drops items lazily', () => {
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

    function* where<T>(source: Iterable<T>, predicate: (item: T) => boolean): IterableIterator<T> {
      for (const item of source) {
        if (predicate(item)) {
          yield item;
        }
      }
    }

    const stringArray = ['abc', 'def', 'ghi'];
    const q1 = where(convertCollectionToUpperCase(stringArray), (s) => s >= 'D');
    const q2 = appendString(q1, '!!!');

    for (const str of q2) {
      con.writeLine(`Main: str >${str}<`);
      con.writeLine();
    }

    expectMatches(
      con.text(),
      `ToUpper: source >abc<
ToUpper: source >def<
AppendString: source >DEF<
Main: str >DEF!!!<

ToUpper: source >ghi<
AppendString: source >GHI<
Main: str >GHI!!!<`,
    );
  });
});
