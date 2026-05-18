/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the three C# examples from "Refactor into pure functions".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/refactor-pure-functions
//
// COMPAT: substituted — C# `static class member` → module-level `let`,
// `StringBuilder` → JS string concatenation. The point of the article — that
// each style produces the same observable output but with different purity
// trade-offs — is preserved.

import { describe, it } from 'vitest';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Refactor into pure functions (conceptual)', () => {
  it('non-pure function: mutates a module-level variable', () => {
    const con = createConsole();

    let aMember = 'StringOne';
    const hyphenatedConcat = (appendStr: string): void => {
      aMember += '-' + appendStr;
    };

    hyphenatedConcat('StringTwo');
    con.writeLine(aMember);

    expectMatches(con.text(), `StringOne-StringTwo`);
  });

  it('non-pure function: mutates a parameter (call-by-reference effect)', () => {
    const con = createConsole();

    const hyphenatedConcat = (sb: { value: string }, appendStr: string): void => {
      sb.value += '-' + appendStr;
    };

    const sb1 = { value: 'StringOne' };
    hyphenatedConcat(sb1, 'StringTwo');
    con.writeLine(sb1.value);

    expectMatches(con.text(), `StringOne-StringTwo`);
  });

  it('pure function: takes inputs, returns a new string, mutates nothing', () => {
    const con = createConsole();

    const hyphenatedConcat = (s: string, appendStr: string): string =>
      s + '-' + appendStr;

    const s1 = 'StringOne';
    const s2 = hyphenatedConcat(s1, 'StringTwo');
    con.writeLine(s2);

    expectMatches(con.text(), `StringOne-StringTwo`);
  });
});
