/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XDeclaration(String, String, String) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdeclaration.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XComment, XDeclaration, XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XDeclaration(String, String, String) constructor', () => {
  // COMPAT: The .NET example uses `doc.Save("Root.xml")` followed by
  // `File.ReadAllText`. The serialized form is identical to
  // `doc.toStringWithIndentation()`, which is what `con.writeLine(doc)` in our
  // harness produces; we substitute the round-trip-via-file for the in-memory
  // equivalent. The intent — that the declaration is serialized with the
  // document — is preserved.
  it('a document with a declaration serializes the declaration as the first line', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument doc = new XDocument(
    //     new XDeclaration("1.0", "utf-8", "yes"),
    //     new XComment("This is a comment"),
    //     new XElement("Root", "content")
    // );
    // doc.Save("Root.xml");
    // Console.WriteLine(File.ReadAllText("Root.xml"));
    // ---------------------

    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', 'yes'),
      new XComment('This is a comment'),
      new XElement('Root', 'content'),
    );
    con.writeLine(doc);

    expectMatches(
      con.text(),
      `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<!--This is a comment-->
<Root>content</Root>`,
    );
  });
});
