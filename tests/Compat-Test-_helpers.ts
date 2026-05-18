/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Compat-Test-_helpers.ts
// Shared utilities for the Compat-Test suite. Each Compat-Test-<topic>.test.ts
// file ports one C# example from the .NET LINQ-to-XML reference docs and
// asserts that the LtXmlTs port produces the same captured output.
//
// Design notes (read once, then trust):
//
// 1) Output capture.
//    .NET examples are written against `Console.WriteLine(value)`. `createConsole()`
//    returns a buffer-backed shim with the same shape: `con.writeLine(v)` appends
//    one line; `con.text()` returns the concatenation. The .NET docs' "produces
//    the following output:" block is compared against this concatenation.
//
// 2) Value formatting (`formatLikeDotNet`).
//    `Console.WriteLine` calls `Object.ToString()` on its argument. We emulate
//    the subset of .NET's ToString conventions actually used by the docs:
//      - `null`/`undefined`  -> "" (Console.WriteLine prints an empty line)
//      - `true` / `false`    -> "True" / "False"      (.NET capitalization)
//      - `XElement` / `XDocument`  -> `.toStringWithIndentation()` to match
//        .NET's indented default ToString().
//      - Everything else falls through to `.toString()` / `String(v)`.
//
// 3) Quote-style normalization (intentional baseline divergence).
//    .NET serializes attributes with double quotes (`foo="bar"`); the LtXmlTs
//    port uses single quotes (`foo='bar'`). This is a cosmetic difference, not
//    a semantic one. `expectMatches` normalizes single-quoted attribute syntax
//    to double-quoted before comparing. The normalization is regex-based and
//    only touches `=' ... '` sequences, so attribute values that literally
//    contain a single quote escape sequence (`&apos;`) are still safe.
//
// 3a) Empty-element style normalization.
//     .NET serializes empty elements as `<Tag></Tag>`; the LtXmlTs port uses
//     `<Tag />`. Both are semantically equivalent. We canonicalize both to
//     `<Tag />`.
//
// 4) Whitespace normalization.
//    `expectMatches` strips trailing whitespace from each line and trims
//    leading/trailing blank lines from both sides before comparing. The .NET
//    docs' expected-output blocks rarely include a trailing newline, and the
//    port's indented serialization sometimes does.
//
// 5) Non-cosmetic divergence policy.
//    If a ported example fails for any reason beyond what (3) and (4) normalize,
//    that is a real compatibility signal. Mark the test `it.skip(...)` with a
//    one-line `// COMPAT: <reason>` comment citing the relevant row in Table 2
//    of the plan. NEVER edit the expected-output string to make it pass.

import { expect } from 'vitest';
import { XElement, XDocument } from 'ltxmlts';

export interface CompatConsole {
  /** Append a value followed by an implicit newline. Matches `Console.WriteLine`. */
  writeLine(v?: unknown): void;
  /** Append a value with no trailing newline. Matches `Console.Write`. */
  write(v: unknown): void;
  /** Append a blank line (no value). Matches parameterless `Console.WriteLine()`. */
  blankLine(): void;
  /** The buffered output. */
  text(): string;
}

export function createConsole(): CompatConsole {
  // Each entry is one line; final join inserts '\n' between them. A bare
  // `writeLine()` (blankLine) pushes ''; that produces a blank line in the
  // joined output.
  const lines: string[] = [];
  // Pending content from a `write()` that hasn't yet been terminated by a
  // writeLine. We collapse it onto the next line at flush time.
  let pending = '';

  return {
    writeLine(v?: unknown) {
      const s = v === undefined ? '' : formatLikeDotNet(v);
      lines.push(pending + s);
      pending = '';
    },
    write(v: unknown) {
      pending += formatLikeDotNet(v);
    },
    blankLine() {
      lines.push(pending);
      pending = '';
    },
    text() {
      // If there's an un-terminated write(), flush it as a final line.
      return pending ? [...lines, pending].join('\n') : lines.join('\n');
    },
  };
}

function formatLikeDotNet(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  // .NET's XNode.ToString() returns indented XML by default. The TS port's
  // toString() omits indentation; toStringWithIndentation() matches .NET.
  if (v instanceof XElement || v instanceof XDocument) {
    return v.toStringWithIndentation();
  }
  // XAttribute / XCData / XComment / XText / XProcessingInstruction /
  // XDeclaration / XName / XNamespace and plain values fall through.
  if (typeof v === 'object' && v !== null && 'toString' in v) {
    return (v as { toString(): string }).toString();
  }
  return String(v);
}

/**
 * Compare a captured Console buffer to a documented expected-output block.
 *
 * Applies (and only applies) the cosmetic normalizations described in the
 * file-header notes: attribute quote style + trailing-whitespace / blank-line
 * trimming. Any other divergence will fail loudly and is by design — the
 * compat suite's value lies in surfacing real drift.
 */
export function expectMatches(actual: string, expected: string): void {
  expect(normalize(actual)).toBe(normalize(expected));
}

function normalize(s: string): string {
  return (
    s
      // Normalize attribute quote style: single → double. Only inside
      // `="..."` style attribute markup, so this is safe for arbitrary text.
      .replace(/=('([^']*)')/g, '="$2"')
      // Canonicalize empty elements: `<Tag attrs></Tag>` → `<Tag attrs />`.
      // The pattern matches a start tag (name + optional double-quoted attrs)
      // followed immediately by the matching close tag with no content between.
      .replace(
        /<([A-Za-z_][\w.-]*(?::[\w.-]+)?)((?:\s+[\w.:-]+="[^"]*")*)\s*>\s*<\/\1>/g,
        '<$1$2 />',
      )
      // Collapse Windows line endings.
      .replace(/\r\n/g, '\n')
      // Strip trailing whitespace per line.
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      // Trim leading/trailing blank lines.
      .replace(/^\n+/, '')
      .replace(/\n+$/, '')
  );
}
