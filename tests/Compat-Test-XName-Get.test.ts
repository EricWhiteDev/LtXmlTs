/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XName.Get method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xname.get?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement, XName, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XName.Get', () => {
  // COMPAT (port behavior, intentional): when an element is in a namespace
  // without a preferred prefix, .NET emits `<Root xmlns="...">` (a default
  // namespace). The TS port auto-generates a `p0` prefix
  // (`<p0:Root xmlns:p0="...">...</p0:Root>`). The expected output below is
  // adjusted to the port's emission.
  it('Get(String) parses Clark notation and constructs a namespaced element', () => {
    const con = createConsole();

    // ---- C# original ----
    // XName name = XName.Get("{http://www.adventure-works.com}Root");
    // XElement el = new XElement(name, "content");
    // Console.WriteLine(el);
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement el2 = new XElement(aw + "Root", "content");
    // Console.WriteLine(el2);
    // ---------------------

    const name = XName.get('{http://www.adventure-works.com}Root');
    const el = new XElement(name, 'content');
    con.writeLine(el);

    const aw = XNamespace.get('http://www.adventure-works.com');
    const el2 = new XElement(aw + 'Root', 'content');
    con.writeLine(el2);

    expectMatches(
      con.text(),
      `<p0:Root xmlns:p0="http://www.adventure-works.com">content</p0:Root>
<p0:Root xmlns:p0="http://www.adventure-works.com">content</p0:Root>`,
    );
  });

  // COMPAT: argument order differs. .NET `XName.Get(localName, namespaceName)`
  // takes (string, string). TS `XName.get(namespace, localName)` takes
  // (XNamespace, string). Same semantics, swapped position.
  // COMPAT (port behavior, intentional): same auto-generated-`p0:`-prefix
  // emission as the first test in this file; expected output adjusted.
  it('Get(String, String) builds an XName from local name + namespace URI', () => {
    const con = createConsole();

    // ---- C# original ----
    // XName name = XName.Get("Root", "http://www.adventure-works.com");
    // XElement el = new XElement(name, "content");
    // Console.WriteLine(el);
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement el2 = new XElement(aw + "Root", "content");
    // Console.WriteLine(el2);
    // ---------------------

    const name = XName.get(XNamespace.get('http://www.adventure-works.com'), 'Root');
    const el = new XElement(name, 'content');
    con.writeLine(el);

    const aw = XNamespace.get('http://www.adventure-works.com');
    const el2 = new XElement(aw + 'Root', 'content');
    con.writeLine(el2);

    expectMatches(
      con.text(),
      `<p0:Root xmlns:p0="http://www.adventure-works.com">content</p0:Root>
<p0:Root xmlns:p0="http://www.adventure-works.com">content</p0:Root>`,
    );
  });
});
