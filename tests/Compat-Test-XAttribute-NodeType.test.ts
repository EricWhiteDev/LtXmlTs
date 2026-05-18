/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.NodeType property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.nodetype?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.NodeType', () => {
  it('reports "Attribute" as the node type', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att", "content")
    // );
    // XAttribute att = root.FirstAttribute;
    // Console.WriteLine(att.NodeType);
    // ---------------------

    const root = new XElement('Root', new XAttribute('Att', 'content'));
    const att = root.firstAttribute!;
    con.writeLine(att.nodeType);

    expectMatches(con.text(), 'Attribute');
  });
});
