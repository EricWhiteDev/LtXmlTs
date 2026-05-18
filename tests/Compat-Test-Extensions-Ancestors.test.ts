/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from Extensions.Ancestors method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.extensions.ancestors?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement, ancestors } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Extensions.Ancestors', () => {
  it('Ancestors() over a sequence flattens ancestors of every source node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", new XElement("GrandChild1", new XElement("GreatGrandChild1", "content"))),
    //     new XElement("Child2", new XElement("GrandChild2", new XElement("GreatGrandChild2", "content"))));
    // var greatGrandChildren = from el in xmlTree.Descendants()
    //                           where el.Name.LocalName.StartsWith("Great") select el;
    // Console.WriteLine("Great Grand Children Elements");
    // Console.WriteLine("----");
    // foreach (var de in greatGrandChildren) Console.WriteLine(de.Name);
    // var allAncestors = greatGrandChildren.Ancestors().Distinct();
    // Console.WriteLine(""); Console.WriteLine("Ancestors"); Console.WriteLine("----");
    // foreach (var de in allAncestors) Console.WriteLine(de.Name);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement(
        'Child1',
        new XElement('GrandChild1', new XElement('GreatGrandChild1', 'content')),
      ),
      new XElement(
        'Child2',
        new XElement('GrandChild2', new XElement('GreatGrandChild2', 'content')),
      ),
    );
    const greatGrandChildren = xmlTree
      .descendants()
      .filter((el) => el.name.localName.startsWith('Great'));

    con.writeLine('Great Grand Children Elements');
    con.writeLine('----');
    for (const de of greatGrandChildren) {
      con.writeLine(de.name);
    }

    // .Distinct() — TS equivalent via Set keyed by reference.
    const allAncestors = Array.from(new Set(ancestors(greatGrandChildren)));

    con.writeLine('');
    con.writeLine('Ancestors');
    con.writeLine('----');
    for (const de of allAncestors) {
      con.writeLine(de.name);
    }

    expectMatches(
      con.text(),
      `Great Grand Children Elements
----
GreatGrandChild1
GreatGrandChild2

Ancestors
----
GrandChild1
Child1
Root
GrandChild2
Child2`,
    );
  });

  it('Ancestors(XName) filters across the flattened ancestor sequence', () => {
    const con = createConsole();

    // ---- C# original ----
    // (same tree)
    // var allAncestors = greatGrandChildren.Ancestors("Child1");
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement(
        'Child1',
        new XElement('GrandChild1', new XElement('GreatGrandChild1', 'content')),
      ),
      new XElement(
        'Child2',
        new XElement('GrandChild2', new XElement('GreatGrandChild2', 'content')),
      ),
    );
    const greatGrandChildren = xmlTree
      .descendants()
      .filter((el) => el.name.localName.startsWith('Great'));

    con.writeLine('Great Grand Children Elements');
    con.writeLine('----');
    for (const de of greatGrandChildren) {
      con.writeLine(de.name);
    }

    const allAncestors = ancestors(greatGrandChildren, 'Child1');

    con.writeLine('');
    con.writeLine('Ancestors');
    con.writeLine('----');
    for (const de of allAncestors) {
      con.writeLine(de.name);
    }

    expectMatches(
      con.text(),
      `Great Grand Children Elements
----
GreatGrandChild1
GreatGrandChild2

Ancestors
----
Child1`,
    );
  });
});
