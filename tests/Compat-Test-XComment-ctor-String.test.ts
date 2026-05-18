/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XComment(String) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcomment.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XComment, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XComment(String) constructor', () => {
  it('creates an element containing a comment as a child node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XComment("This is a comment")
    // );
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement('Root', new XComment('This is a comment'));
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <!--This is a comment-->
</Root>`,
    );
  });
});
