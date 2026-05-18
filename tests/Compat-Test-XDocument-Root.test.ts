/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XDocument.Root property reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocument.root?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XComment, XDocument, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XDocument.Root', () => {
  it('returns the root element (ignoring sibling comments)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument doc = new XDocument(
    //     new XComment("This is a comment."),
    //     new XElement("Pubs",
    //         new XElement("Book",
    //             new XElement("Title", "Artifacts of Roman Civilization"),
    //             new XElement("Author", "Moreno, Jordao")),
    //         new XElement("Book",
    //             new XElement("Title", "Midieval Tools and Implements"),
    //             new XElement("Author", "Gazit, Inbar"))),
    //     new XComment("This is another comment.")
    // );
    // Console.WriteLine(doc.Root.Name.ToString());
    // ---------------------

    const doc = new XDocument(
      new XComment('This is a comment.'),
      new XElement(
        'Pubs',
        new XElement(
          'Book',
          new XElement('Title', 'Artifacts of Roman Civilization'),
          new XElement('Author', 'Moreno, Jordao'),
        ),
        new XElement(
          'Book',
          new XElement('Title', 'Midieval Tools and Implements'),
          new XElement('Author', 'Gazit, Inbar'),
        ),
      ),
      new XComment('This is another comment.'),
    );
    con.writeLine(doc.root!.name.toString());

    expectMatches(con.text(), `Pubs`);
  });
});
