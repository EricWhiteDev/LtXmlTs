/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.IsNamespaceDeclaration property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.isnamespacedeclaration?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.IsNamespaceDeclaration', () => {
  it('distinguishes a namespace-declaration attribute from an ordinary one', () => {
    const con = createConsole();

    // ---- C# original ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement root = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XAttribute(aw + "Att", "content")
    // );
    // foreach (XAttribute att in root.Attributes()) {
    //     if (att.IsNamespaceDeclaration)
    //         Console.WriteLine("{0} is a namespace declaration", att.Name);
    //     else
    //         Console.WriteLine("{0} is not a namespace declaration", att.Name);
    // }
    // ---------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const root = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XAttribute(aw + 'Att', 'content'),
    );

    for (const att of root.attributes()) {
      if (att.isNamespaceDeclaration) {
        con.writeLine(`${att.name} is a namespace declaration`);
      } else {
        con.writeLine(`${att.name} is not a namespace declaration`);
      }
    }

    expectMatches(
      con.text(),
      `{http://www.w3.org/2000/xmlns/}aw is a namespace declaration
{http://www.adventure-works.com}Att is not a namespace declaration`,
    );
  });
});
