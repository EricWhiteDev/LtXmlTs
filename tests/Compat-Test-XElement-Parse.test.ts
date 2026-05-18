/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XElement.Parse(String) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement.parse?view=netframework-4.8.1
//
// The Parse(String, LoadOptions) page additionally has examples using LoadOptions.SetLineInfo
// and IXmlLineInfo casts; those are non-portable per Table 2 (no line-info tracking in port)
// and are omitted here.

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XElement.Parse(String)', () => {
  it('parses XML text into an element; default does not preserve insignificant whitespace', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = XElement.Parse("<Root> <Child> </Child> </Root>");
    // Console.WriteLine(xmlTree);
    // ---------------------

    const xmlTree = XElement.parse('<Root> <Child> </Child> </Root>');
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child></Child>
</Root>`,
    );
  });
});
