/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.SetValue method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.setvalue?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.SetValue(Object)', () => {
  // COMPAT: TS port exposes value via assignment (`el.value = "new content"`)
  // rather than a SetValue method; semantically equivalent.
  it('replaces all child nodes with a single text node containing the new value', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root", new XElement("Child", "child content"));
    // root.SetValue("new content");
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement('Root', new XElement('Child', 'child content'));
    root.value = 'new content';
    con.writeLine(root);

    expectMatches(con.text(), `<Root>new content</Root>`);
  });
});
