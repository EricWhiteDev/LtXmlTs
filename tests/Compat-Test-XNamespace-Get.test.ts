/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XNamespace.Get(String) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnamespace.get?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XNamespace.Get(String)', () => {
  // COMPAT (port behavior, intentional): `XNamespace.toString()` returns the
  // Clark-notation-wrapped form `{uri}` rather than .NET's bare URI form.
  // The wrapping makes `ns + 'local'` produce a parseable Clark name in TS
  // (where there is no operator overloading). The expected output below is
  // adjusted to the port's emission.
  it('returns the atomic XNamespace for a given URI', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = XNamespace.Get("http://www.adventure-works.com");
    // XNamespace aw2 = "http://www.adventure-works.com";   // implicit conversion
    // Console.WriteLine(aw);
    // Console.WriteLine(aw2);
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const aw2 = XNamespace.get('http://www.adventure-works.com');
    con.writeLine(aw);
    con.writeLine(aw2);

    expectMatches(
      con.text(),
      `{http://www.adventure-works.com}
{http://www.adventure-works.com}`,
    );
  });
});
