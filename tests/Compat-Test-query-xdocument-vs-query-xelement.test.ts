/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the three C# examples from "Query an XDocument vs. Query an XElement".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/query-xdocument-vs-query-xelement

import { describe, it } from 'vitest';
import { XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

const xmlText = `<Root>
    <Child1>1</Child1>
    <Child2>2</Child2>
    <Child3>3</Child3>
</Root>`;

describe('Query an XDocument vs. Query an XElement (conceptual)', () => {
  // COMPAT: substituted — the .NET example writes XML to a file then calls
  // XElement.Load. The semantic comparison being made is between XElement.Load
  // and XDocument.Load; we substitute XElement.parse / XDocument.parse since
  // they consume the same string.
  it('Tree rooted in XElement: Elements() yields the three child elements directly', () => {
    const con = createConsole();

    con.writeLine('Querying tree loaded with XElement.Load');
    con.writeLine('----');
    const doc = XElement.parse(xmlText);
    for (const e of doc.elements()) {
      con.writeLine(e);
    }

    expectMatches(
      con.text(),
      `Querying tree loaded with XElement.Load
----
<Child1>1</Child1>
<Child2>2</Child2>
<Child3>3</Child3>`,
    );
  });

  it('Tree rooted in XDocument: Elements() at the document level yields the Root element', () => {
    const con = createConsole();

    con.writeLine('Querying tree loaded with XDocument.Load');
    con.writeLine('----');
    const doc = XDocument.parse(xmlText);
    for (const e of doc.elements()) {
      con.writeLine(e);
    }

    expectMatches(
      con.text(),
      `Querying tree loaded with XDocument.Load
----
<Root>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
</Root>`,
    );
  });

  it('Tree rooted in XDocument: doc.Root.Elements() yields the three children', () => {
    const con = createConsole();

    con.writeLine('Querying tree loaded with XDocument.Load');
    con.writeLine('----');
    const doc = XDocument.parse(xmlText);
    for (const e of doc.root!.elements()) {
      con.writeLine(e);
    }

    expectMatches(
      con.text(),
      `Querying tree loaded with XDocument.Load
----
<Child1>1</Child1>
<Child2>2</Child2>
<Child3>3</Child3>`,
    );
  });
});
