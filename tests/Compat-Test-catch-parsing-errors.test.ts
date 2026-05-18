/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to catch parsing errors".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/catch-parsing-errors
//
// COMPAT: substituted — the .NET example asserts the exact text of the .NET
// XmlException message. The LtXmlTs port throws its own error class
// (XmlParseError) with its own message format. The semantic claim of the
// example (parsing invalid XML throws, and the application can catch the
// error) is preserved; the message text is not compared.

import { describe, it, expect } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole } from './Compat-Test-_helpers.js';

describe('Catch parsing errors (conceptual)', () => {
  it('XElement.parse on malformed XML throws, and the caller can catch and print', () => {
    const con = createConsole();

    try {
      const contacts = XElement.parse(
        `<Contacts>
            <Contact>
                <Name>Jim Wilson</Name>
            </Contact>
          </Contcts>`,
      );
      con.writeLine(contacts);
    } catch (e) {
      con.writeLine((e as Error).message);
    }

    expect(con.text().length).toBeGreaterThan(0);
    expect(con.text()).not.toContain('<Contacts>');
  });
});
