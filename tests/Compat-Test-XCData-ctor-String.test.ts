/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XCData(String) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcdata.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XCData, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XCData(String) constructor', () => {
  it('creates an element containing a CDATA node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XCData("Some content")
    // );
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement('Root', new XCData('Some content'));
    con.writeLine(root);

    expectMatches(con.text(), `<Root><![CDATA[Some content]]></Root>`);
  });
});
