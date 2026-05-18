/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to control namespace prefixes".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/control-namespace-prefixes

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Control namespace prefixes (conceptual)', () => {
  it('explicit xmlns:prefix attributes select the prefixes used at serialization', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XNamespace fc = "www.fourthcoffee.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XAttribute(XNamespace.Xmlns + "fc", "www.fourthcoffee.com"),
    //     new XElement(fc + "Child",
    //         new XElement(aw + "DifferentChild", "other content")),
    //     new XElement(aw + "Child2", "c2 content"),
    //     new XElement(fc + "Child3", "c3 content"));
    // Console.WriteLine(root);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const fc = XNamespace.get('www.fourthcoffee.com');
    const root = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XAttribute(XNamespace.xmlns + 'fc', 'www.fourthcoffee.com'),
      new XElement(
        fc + 'Child',
        new XElement(aw + 'DifferentChild', 'other content'),
      ),
      new XElement(aw + 'Child2', 'c2 content'),
      new XElement(fc + 'Child3', 'c3 content'),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<aw:Root xmlns:aw="http://www.adventure-works.com" xmlns:fc="www.fourthcoffee.com">
  <fc:Child>
    <aw:DifferentChild>other content</aw:DifferentChild>
  </fc:Child>
  <aw:Child2>c2 content</aw:Child2>
  <fc:Child3>c3 content</fc:Child3>
</aw:Root>`,
    );
  });
});
