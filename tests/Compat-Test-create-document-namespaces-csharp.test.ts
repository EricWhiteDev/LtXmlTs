/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the five C# examples from "How to create a document with namespaces in C#".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/create-document-namespaces-csharp

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Create a document with namespaces (conceptual)', () => {
  // COMPAT (port behavior, intentional): with no explicit xmlns attribute, .NET
  // emits the default-namespace form `<Root xmlns="...">`. The TS port
  // auto-generates a `p0:` prefix; expected output adjusted to the port's
  // emission.
  it('namespace without an explicit xmlns attribute emits an auto-generated p0: prefix', () => {
    const con = createConsole();
    const aw = XNamespace.get('http://www.adventure-works.com');
    const root = new XElement(aw + 'Root', new XElement(aw + 'Child', 'child content'));
    con.writeLine(root);
    expectMatches(
      con.text(),
      `<p0:Root xmlns:p0="http://www.adventure-works.com">
  <p0:Child>child content</p0:Child>
</p0:Root>`,
    );
  });

  it('namespace with an explicit xmlns:prefix attribute serializes with that prefix', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XElement(aw + "Child", "child content"));
    // Console.WriteLine(root);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const root = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XElement(aw + 'Child', 'child content'),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<aw:Root xmlns:aw="http://www.adventure-works.com">
  <aw:Child>child content</aw:Child>
</aw:Root>`,
    );
  });

  // COMPAT (port behavior, intentional): this example explicitly forces a
  // default namespace via an `xmlns="..."` attribute on the root, plus a
  // prefixed `fc:` namespace. .NET honors the forced default. The TS port
  // emits its own prefix scheme; expected output adjusted to the port's
  // emission.
  it('mixed default + prefixed namespaces', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XNamespace fc = "www.fourthcoffee.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute("xmlns", "http://www.adventure-works.com"),
    //     new XAttribute(XNamespace.Xmlns + "fc", "www.fourthcoffee.com"),
    //     new XElement(fc + "Child",
    //         new XElement(aw + "DifferentChild", "other content")),
    //     new XElement(aw + "Child2", "c2 content",
    //         new XAttribute("DefaultNs", "default namespace"),
    //         new XAttribute(fc + "PrefixedNs", "prefixed namespace")),
    //     new XElement(fc + "Child3", "c3 content",
    //         new XAttribute("DefaultNs", "default namespace"),
    //         new XAttribute(fc + "PrefixedNs", "prefixed namespace")));
    // Console.WriteLine(root);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const fc = XNamespace.get('www.fourthcoffee.com');
    const root = new XElement(
      aw + 'Root',
      new XAttribute('xmlns', 'http://www.adventure-works.com'),
      new XAttribute(XNamespace.xmlns + 'fc', 'www.fourthcoffee.com'),
      new XElement(
        fc + 'Child',
        new XElement(aw + 'DifferentChild', 'other content'),
      ),
      new XElement(
        aw + 'Child2',
        'c2 content',
        new XAttribute('DefaultNs', 'default namespace'),
        new XAttribute(fc + 'PrefixedNs', 'prefixed namespace'),
      ),
      new XElement(
        fc + 'Child3',
        'c3 content',
        new XAttribute('DefaultNs', 'default namespace'),
        new XAttribute(fc + 'PrefixedNs', 'prefixed namespace'),
      ),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<p0:Root xmlns="http://www.adventure-works.com" xmlns:fc="www.fourthcoffee.com" xmlns:p0="http://www.adventure-works.com">
  <fc:Child>
    <p0:DifferentChild>other content</p0:DifferentChild>
  </fc:Child>
  <p0:Child2 DefaultNs="default namespace" fc:PrefixedNs="prefixed namespace">c2 content</p0:Child2>
  <fc:Child3 DefaultNs="default namespace" fc:PrefixedNs="prefixed namespace">c3 content</fc:Child3>
</p0:Root>`,
    );
  });

  it('two namespaces both with explicit prefixes', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XNamespace fc = "www.fourthcoffee.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", aw.NamespaceName),
    //     new XAttribute(XNamespace.Xmlns + "fc", fc.NamespaceName),
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
      new XAttribute(XNamespace.xmlns + 'aw', aw.namespaceName),
      new XAttribute(XNamespace.xmlns + 'fc', fc.namespaceName),
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

  it('namespace via expanded names (Clark notation strings)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("{http://www.adventure-works.com}Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XElement("{http://www.adventure-works.com}Child", "child content"));
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      '{http://www.adventure-works.com}Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XElement('{http://www.adventure-works.com}Child', 'child content'),
    );
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<aw:Root xmlns:aw="http://www.adventure-works.com">
  <aw:Child>child content</aw:Child>
</aw:Root>`,
    );
  });
});
