/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from Extensions.InDocumentOrder method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.extensions.indocumentorder?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement, inDocumentOrder } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Extensions.InDocumentOrder', () => {
  it('sorts an out-of-order element list by document position', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Item", new XElement("aaa", 1), new XElement("bbb", 2)),
    //     new XElement("Item", new XElement("ccc", 3), new XElement("aaa", 4)),
    //     new XElement("Item", new XElement("ddd", 5), new XElement("eee", 6)));
    // XElement[] elementList = {
    //     xmlTree.Descendants("ddd").First(),
    //     xmlTree.Descendants("ccc").First(),
    //     xmlTree.Descendants("aaa").First()
    // };
    // foreach (XElement el in elementList.InDocumentOrder()) Console.WriteLine(el);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Item', new XElement('aaa', 1), new XElement('bbb', 2)),
      new XElement('Item', new XElement('ccc', 3), new XElement('aaa', 4)),
      new XElement('Item', new XElement('ddd', 5), new XElement('eee', 6)),
    );
    const elementList = [
      xmlTree.descendants('ddd')[0],
      xmlTree.descendants('ccc')[0],
      xmlTree.descendants('aaa')[0],
    ];
    for (const el of inDocumentOrder(elementList)) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `<aaa>1</aaa>
<ccc>3</ccc>
<ddd>5</ddd>`,
    );
  });
});
