/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from the "Intermediate materialization (C#)" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/intermediate-materialization

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Intermediate materialization (conceptual)', () => {
  // COMPAT: substituted — C# `yield return` → TS `function*` + `yield`;
  // `IEnumerable<string>.ToList()` → `Array.from(...)`. The materialization
  // semantics (the entire source is enumerated before the next stage's first
  // yield) is the semantic point and is preserved.
  it('a ToList() inside a generator forces the full source to be enumerated up front', () => {
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
      // Materialize the source via Array.from — same effect as C# ToList().
      for (const str of Array.from(source)) {
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
ToUpper: source >def<
ToUpper: source >ghi<
AppendString: source >ABC<
Main: str >ABC!!!<

AppendString: source >DEF<
Main: str >DEF!!!<

AppendString: source >GHI<
Main: str >GHI!!!<`,
    );
  });
});
