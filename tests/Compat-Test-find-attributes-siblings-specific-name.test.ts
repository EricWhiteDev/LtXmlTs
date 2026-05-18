/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find attributes of siblings with a specific name".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-attributes-siblings-specific-name
//
// COMPAT: Books.xml substituted with an inline parse synthesized from the
// documented output `id="bk101"`/`id="bk102"`.

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find attributes of siblings with a specific name (conceptual)', () => {
  it('book.Parent.Elements("Book").Select(b => b.Attribute("id")) yields the id of every sibling Book', () => {
    const con = createConsole();

    const books = XDocument.parse(`<Catalog>
  <Book id="bk101"><Title>XML Developer's Guide</Title></Book>
  <Book id="bk102"><Title>Midnight Rain</Title></Book>
</Catalog>`);

    const book = books.root!.element('Book')!;
    const list1 = book.parent!.elements('Book').map((el) => el.attribute('id')!);

    con.writeLine('Results are identical');
    for (const att of list1) {
      con.writeLine(att);
    }

    expectMatches(
      con.text(),
      `Results are identical
id="bk101"
id="bk102"`,
    );
  });
});
