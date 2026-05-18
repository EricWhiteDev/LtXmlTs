/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.Name property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.name?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.Name', () => {
  // COMPAT: The .NET example's second half passes the result of a LINQ select
  // (an IEnumerable<XAttribute>) positionally to XElement, which .NET recursively
  // unpacks into the new element's attribute list. The TS port's
  // `addAttributeContentObject` (src/XElement.ts:301) does NOT recurse into
  // arrays — only `addContentObject` (for nodes) does. As a result the projected
  // attribute array is silently dropped from `newRoot`, so the last two output
  // lines never appear. Same gap as Compat-Test-XAttribute-ctor-XName-Object.
  it.skip('iterates attribute names (Clark notation for namespaced names) and copies a name into a new attribute', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XAttribute(aw + "Att", "content"),
    //     new XAttribute("Att2", "different content")
    // );
    // foreach (XAttribute att in root.Attributes())
    //     Console.WriteLine("{0}={1}", att.Name, att.Value);
    // Console.WriteLine("");
    // XElement newRoot = new XElement(aw + "Root",
    //     from att in root.Attributes("Att2")
    //     select new XAttribute(att.Name, "new content"));
    // foreach (XAttribute att in newRoot.Attributes())
    //     Console.WriteLine("{0}={1}", att.Name, att.Value);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const root = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XAttribute(aw + 'Att', 'content'),
      new XAttribute('Att2', 'different content'),
    );

    for (const att of root.attributes()) {
      con.writeLine(`${att.name}=${att.value}`);
    }
    con.writeLine('');

    const newRoot = new XElement(
      aw + 'Root',
      root.attributes('Att2').map((att) => new XAttribute(att.name, 'new content')),
    );

    for (const att of newRoot.attributes()) {
      con.writeLine(`${att.name}=${att.value}`);
    }

    expectMatches(
      con.text(),
      `{http://www.w3.org/2000/xmlns/}aw=http://www.adventure-works.com
{http://www.adventure-works.com}Att=content
Att2=different content

Att2=new content`,
    );
  });
});
