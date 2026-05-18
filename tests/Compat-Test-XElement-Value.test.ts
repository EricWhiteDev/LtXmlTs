/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.Value property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.value?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.Value', () => {
  it('returns the concatenated text content (mixed content -> joined text)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement el = XElement.Parse("<Root>This is <b>mixed</b> content</Root>");
    // Console.WriteLine("{0}", el.Value);
    // ---------------------

    const el = XElement.parse('<Root>This is <b>mixed</b> content</Root>');
    con.writeLine(el.value);

    expectMatches(con.text(), `This is mixed content`);
  });
});
