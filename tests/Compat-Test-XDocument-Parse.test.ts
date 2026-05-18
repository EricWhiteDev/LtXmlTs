/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XDocument.Parse(String) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocument.parse?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XDocument.Parse(String)', () => {
  // COMPAT (port behavior, intentional): the TS port's `toStringWithIndentation()`
  // preserves and emits the parsed XML declaration; .NET's `XDocument.ToString()`
  // omits it. Expected output below is adjusted to the port's emission.
  it('parses XML text (with declaration and comment) into an XDocument', () => {
    const con = createConsole();

    // ---- C# original ----
    // string str = @"<?xml version=""1.0""?>
    // <!-- comment at the root level -->
    // <Root>
    //     <Child>Content</Child>
    // </Root>";
    // XDocument doc = XDocument.Parse(str);
    // Console.WriteLine(doc);
    // ---------------------

    const str = `<?xml version="1.0"?>
<!-- comment at the root level -->
<Root>
    <Child>Content</Child>
</Root>`;
    const doc = XDocument.parse(str);
    con.writeLine(doc);

    expectMatches(
      con.text(),
      `<?xml version="1.0"?>
<!-- comment at the root level -->
<Root>
  <Child>Content</Child>
</Root>`,
    );
  });
});
