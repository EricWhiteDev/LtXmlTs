/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XNamespace.GetName(String) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnamespace.getname?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNamespace.GetName(String)', () => {
  it('builds an XName from this namespace + a local name (Clark notation in ToString)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XName name = aw.GetName("Root");
    // Console.WriteLine("{0}", name);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const name = aw.getName('Root');
    con.writeLine(name);

    expectMatches(con.text(), `{http://www.adventure-works.com}Root`);
  });
});
