/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XProcessingInstruction(String, String) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xprocessinginstruction.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XProcessingInstruction } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XProcessingInstruction(String, String) constructor', () => {
  it('creates a processing instruction with target and data', () => {
    const con = createConsole();

    // ---- C# original ----
    // XProcessingInstruction pi = new XProcessingInstruction("xml-stylesheet", "type='text/xsl' href='hello.xsl'");
    // Console.WriteLine(pi);
    // ---------------------

    const pi = new XProcessingInstruction(
      'xml-stylesheet',
      "type='text/xsl' href='hello.xsl'",
    );
    con.writeLine(pi);

    expectMatches(
      con.text(),
      `<?xml-stylesheet type='text/xsl' href='hello.xsl'?>`,
    );
  });
});
