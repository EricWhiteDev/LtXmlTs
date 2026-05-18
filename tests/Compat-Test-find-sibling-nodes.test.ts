/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find sibling nodes".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-sibling-nodes
//
// COMPAT: substituted — inline XDocument.parse for "Books.xml", and the XPath
// comparison is replaced with a self-compare of the LINQ to XML query (XPath
// is not in the LtXmlTs port).

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find sibling nodes (conceptual)', () => {
  it('Parent.Elements("Book") returns every Book sibling including self', () => {
    const con = createConsole();

    const books = XDocument.parse(`<Catalog>
  <Book id="bk101">
    <Author>Garghentini, Davide</Author>
    <Title>XML Developer's Guide</Title>
    <Genre>Computer</Genre>
    <Price>44.95</Price>
    <PublishDate>2000-10-01</PublishDate>
    <Description>An in-depth look at creating applications
      with XML.</Description>
  </Book>
  <Book id="bk102">
    <Author>Garcia, Debra</Author>
    <Title>Midnight Rain</Title>
    <Genre>Fantasy</Genre>
    <Price>5.95</Price>
    <PublishDate>2000-12-16</PublishDate>
    <Description>A former architect battles corporate zombies,
      an evil sorceress, and her own childhood to become queen
      of the world.</Description>
  </Book>
</Catalog>`);

    const book = books.root!.elements('Book').slice(1)[0]!;
    const list1 = book.parent!.elements('Book');
    const list2 = book.parent!.elements('Book');

    if (
      list1.length === list2.length &&
      list1.every((el, i) => el === list2[i])
    ) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    for (const el of list1) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `Results are identical
<Book id="bk101">
  <Author>Garghentini, Davide</Author>
  <Title>XML Developer's Guide</Title>
  <Genre>Computer</Genre>
  <Price>44.95</Price>
  <PublishDate>2000-10-01</PublishDate>
  <Description>An in-depth look at creating applications
      with XML.</Description>
</Book>
<Book id="bk102">
  <Author>Garcia, Debra</Author>
  <Title>Midnight Rain</Title>
  <Genre>Fantasy</Genre>
  <Price>5.95</Price>
  <PublishDate>2000-12-16</PublishDate>
  <Description>A former architect battles corporate zombies,
      an evil sorceress, and her own childhood to become queen
      of the world.</Description>
</Book>`,
    );
  });
});
