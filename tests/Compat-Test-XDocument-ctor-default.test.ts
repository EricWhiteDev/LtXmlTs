/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XDocument() (parameterless) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocument.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XComment, XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XDocument() default constructor', () => {
  it('builds an empty document, then adds a comment and a root element via Add', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument doc = new XDocument();
    // doc.Add(new XComment("This is a comment"));
    // doc.Add(new XElement("Root", "content"));
    // Console.WriteLine(doc);
    // ---------------------

    const doc = new XDocument();
    doc.add(new XComment('This is a comment'));
    doc.add(new XElement('Root', 'content'));
    con.writeLine(doc);

    expectMatches(
      con.text(),
      `<!--This is a comment-->
<Root>content</Root>`,
    );
  });
});
