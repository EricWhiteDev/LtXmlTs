/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the first C# example from "How to find all nodes in a namespace".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-all-nodes-namespace

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find all nodes in a namespace (conceptual)', () => {
  it('filter Descendants() by Name.Namespace to select only one namespace', () => {
    const con = createConsole();

    const markup = `<aw:Root xmlns:aw='http://www.adventure-works.com' xmlns:fc='www.fourthcoffee.com'>
  <fc:Child1>abc</fc:Child1>
  <fc:Child2>def</fc:Child2>
  <aw:Child3>ghi</aw:Child3>
  <fc:Child4>
    <fc:GrandChild1>jkl</fc:GrandChild1>
    <aw:GrandChild2>mno</aw:GrandChild2>
  </fc:Child4>
</aw:Root>`;

    const xmlTree = XElement.parse(markup);
    con.writeLine('Nodes in the http://www.adventure-works.com namespace');

    const awElements = xmlTree
      .descendants()
      .filter((el) => el.name.namespaceName === 'http://www.adventure-works.com');
    for (const el of awElements) {
      con.writeLine(el.name.toString());
    }

    expectMatches(
      con.text(),
      `Nodes in the http://www.adventure-works.com namespace
{http://www.adventure-works.com}Child3
{http://www.adventure-works.com}GrandChild2`,
    );
  });
});
