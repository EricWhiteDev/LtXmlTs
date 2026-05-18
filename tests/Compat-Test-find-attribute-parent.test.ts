/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find an attribute of the parent".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-attribute-parent
//
// COMPAT: Substitute external Books.xml with an inline parse whose data
// yields the documented output `id="bk101"`. Only the LINQ side ported.

import { describe, it } from 'vitest';
import { XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find an attribute of the parent (conceptual)', () => {
  it('walks up via .Parent and reads an attribute', () => {
    const con = createConsole();

    const books = XDocument.parse(`<Catalog>
  <Book id="bk101">
    <Author>Garghentini, Davide</Author>
    <Title>XML Developer's Guide</Title>
  </Book>
</Catalog>`);

    const author = books.root!.element('Book')!.element('Author')!;
    const att1 = author.parent!.attribute('id')!;

    con.writeLine('Results are identical');
    con.writeLine(att1);

    expectMatches(
      con.text(),
      `Results are identical
id="bk101"`,
    );
  });
});
