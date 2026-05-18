/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the two C# examples (with expected output) from
// "Pre-Atomization of XName objects".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/pre-atomization-xname-objects

import { describe, it } from 'vitest';
import { XAttribute, XElement, XName, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Pre-atomization of XName objects (conceptual)', () => {
  // COMPAT: C# uses `XName Root = "Root"` via implicit string→XName conversion.
  // TS port uses explicit `XName.get('Root')`. Same atomic-name semantics.
  it('creates elements using pre-atomized XName objects (no namespace)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XName Root = "Root"; XName Data = "Data"; XName ID = "ID";
    // XElement root = new XElement(Root,
    //     new XElement(Data, new XAttribute(ID, "1"), "4,100,000"),
    //     new XElement(Data, new XAttribute(ID, "2"), "3,700,000"),
    //     new XElement(Data, new XAttribute(ID, "3"), "1,150,000")
    // );
    // Console.WriteLine(root);
    // ---------------------

    const Root = XName.get('Root');
    const Data = XName.get('Data');
    const ID = XName.get('ID');

    const root = new XElement(
      Root,
      new XElement(Data, new XAttribute(ID, '1'), '4,100,000'),
      new XElement(Data, new XAttribute(ID, '2'), '3,700,000'),
      new XElement(Data, new XAttribute(ID, '3'), '1,150,000'),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <Data ID="1">4,100,000</Data>
  <Data ID="2">3,700,000</Data>
  <Data ID="3">1,150,000</Data>
</Root>`,
    );
  });

  it('pre-atomized XName objects + a namespace with explicit prefix', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XName Root = aw + "Root"; XName Data = aw + "Data"; XName ID = "ID";
    // XElement root = new XElement(Root,
    //     new XAttribute(XNamespace.Xmlns + "aw", aw),
    //     new XElement(Data, new XAttribute(ID, "1"), "4,100,000"),
    //     new XElement(Data, new XAttribute(ID, "2"), "3,700,000"),
    //     new XElement(Data, new XAttribute(ID, "3"), "1,150,000")
    // );
    // Console.WriteLine(root);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const Root = XName.get(aw, 'Root');
    const Data = XName.get(aw, 'Data');
    const ID = XName.get('ID');

    const root = new XElement(
      Root,
      new XAttribute(XNamespace.xmlns + 'aw', aw.namespaceName),
      new XElement(Data, new XAttribute(ID, '1'), '4,100,000'),
      new XElement(Data, new XAttribute(ID, '2'), '3,700,000'),
      new XElement(Data, new XAttribute(ID, '3'), '1,150,000'),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<aw:Root xmlns:aw="http://www.adventure-works.com">
  <aw:Data ID="1">4,100,000</aw:Data>
  <aw:Data ID="2">3,700,000</aw:Data>
  <aw:Data ID="3">1,150,000</aw:Data>
</aw:Root>`,
    );
  });
});
