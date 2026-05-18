/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports portable examples from "Mixed declarative/imperative code bugs".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/mixed-declarative-imperative-code-bugs

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Mixed declarative/imperative code bugs (conceptual)', () => {
  // COMPAT: substituted — C# `.ToList()` → JS `[...arr]` snapshot.
  it('Adding while iterating with ToList snapshot avoids the infinite-loop bug', () => {
    const con = createConsole();

    const root = new XElement(
      'Root',
      new XElement('A', 1),
      new XElement('B', 2),
      new XElement('C', 3),
    );
    for (const e of [...root.elements()]) {
      root.add(new XElement(e.name, e.value));
    }
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <A>1</A>
  <B>2</B>
  <C>3</C>
  <A>1</A>
  <B>2</B>
  <C>3</C>
</Root>`,
    );
  });

  it('Deleting while iterating with ToList snapshot correctly removes all elements', () => {
    const con = createConsole();

    const root = new XElement(
      'Root',
      new XElement('A', 1),
      new XElement('B', 2),
      new XElement('C', 3),
    );
    for (const e of [...root.elements()]) {
      e.remove();
    }
    con.writeLine(root);

    expectMatches(con.text(), `<Root />`);
  });

  it('Functional approach: build a new tree by passing two reads of the source to the constructor', () => {
    const con = createConsole();

    const root = new XElement(
      'Root',
      new XElement('A', 1),
      new XElement('B', 2),
      new XElement('C', 3),
    );
    const newRoot = new XElement('Root', root.elements(), root.elements());
    con.writeLine(newRoot);

    expectMatches(
      con.text(),
      `<Root>
  <A>1</A>
  <B>2</B>
  <C>3</C>
  <A>1</A>
  <B>2</B>
  <C>3</C>
</Root>`,
    );
  });
});
