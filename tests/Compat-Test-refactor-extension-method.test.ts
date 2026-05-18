/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the portable C# sub-example (all four StringConcatenate overloads)
// from "Refactor using an extension method".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/refactor-extension-method
//
// COMPAT: substituted — C# extension methods on IEnumerable<T> become
// standalone helper functions on Iterable. The Office Open XML portion of
// the article (loading SampleDoc.docx) is not portable; only the standalone
// usage example with the four overloads is reproduced here.

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

function stringConcatenate(source: Iterable<string>): string;
function stringConcatenate(source: Iterable<string>, separator: string): string;
function stringConcatenate<T>(source: Iterable<T>, func: (item: T) => string): string;
function stringConcatenate<T>(
  source: Iterable<T>,
  func: (item: T) => string,
  separator: string,
): string;
function stringConcatenate(
  source: Iterable<unknown>,
  funcOrSeparator?: ((item: unknown) => string) | string,
  separator?: string,
): string {
  let sb = '';
  if (typeof funcOrSeparator === 'function') {
    for (const item of source) {
      sb += funcOrSeparator(item);
      if (separator !== undefined) sb += separator;
    }
  } else if (typeof funcOrSeparator === 'string') {
    for (const s of source) {
      sb += String(s) + funcOrSeparator;
    }
  } else {
    for (const s of source) {
      sb += String(s);
    }
  }
  return sb;
}

describe('Refactor using an extension method — all four overloads (conceptual)', () => {
  it('demonstrates the four stringConcatenate overloads', () => {
    const con = createConsole();

    const numbers = ['one', 'two', 'three'];
    con.writeLine(stringConcatenate(numbers));
    con.writeLine(stringConcatenate(numbers, ':'));

    const intNumbers = [1, 2, 3];
    con.writeLine(stringConcatenate(intNumbers, (i) => i.toString()));
    con.writeLine(stringConcatenate(intNumbers, (i) => i.toString(), ':'));

    expectMatches(
      con.text(),
      `onetwothree
one:two:three:
123
1:2:3:`,
    );
  });
});
