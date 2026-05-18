/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute.SetValue method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.setvalue?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute.SetValue', () => {
  it('replaces the attribute value via SetValue', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att1", "content1"),
    //     new XAttribute("Att2", "content2"),
    //     new XAttribute("Att3", "content3")
    // );
    // XAttribute att = root.Attribute("Att2");
    // att.SetValue("new content");
    // Console.WriteLine(root);
    // ---------------------

    const root = new XElement(
      'Root',
      new XAttribute('Att1', 'content1'),
      new XAttribute('Att2', 'content2'),
      new XAttribute('Att3', 'content3'),
    );
    const att = root.attribute('Att2')!;
    att.setValue('new content');
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root Att1="content1" Att2="new content" Att3="content3" />`,
    );
  });
});
