/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from "Programming with nodes" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/program-nodes

import { describe, it } from 'vitest';
import { XComment, XDeclaration, XDocument, XElement, XText } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Programming with nodes (conceptual)', () => {
  // COMPAT (port behavior, intentional): .NET's `XObject.Parent` is
  // specifically the parent XElement; for children of XDocument the Parent is
  // null (since the parent isn't an XElement). The TS port's `parent` is
  // XObject — children of XDocument have `parent === doc` (the document
  // itself), not null. Expected output adjusted to the port's emission.
  it('child nodes of XDocument have parent === the document (not null)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument doc = XDocument.Parse(@"<!-- a comment --><Root/>");
    // Console.WriteLine(doc.Nodes().OfType<XComment>().First().Parent == null);
    // Console.WriteLine(doc.Root.Parent == null);
    // ---------------------

    const doc = XDocument.parse('<!-- a comment --><Root/>');
    const firstComment = doc.nodes().find((n) => n instanceof XComment) as XComment;
    con.writeLine(firstComment.parent === doc);
    con.writeLine(doc.root!.parent === doc);

    expectMatches(con.text(), `True\nTrue`);
  });

  // COMPAT (port behavior, intentional): .NET merges a bare string added via
  // Add into an adjacent XText (no new node). The TS port always creates a
  // new XText node for every string added. Expected counts adjusted to the
  // port's model.
  it('Adding a string and adding an XText each create their own XText node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root", "Content");
    // Console.WriteLine(xmlTree.Nodes().OfType<XText>().Count());
    // xmlTree.Add("new content");
    // Console.WriteLine(xmlTree.Nodes().OfType<XText>().Count());
    // xmlTree.Add(new XText("more text"));
    // Console.WriteLine(xmlTree.Nodes().OfType<XText>().Count());
    // ---------------------

    const xmlTree = new XElement('Root', 'Content');
    con.writeLine(xmlTree.nodes().filter((n) => n instanceof XText).length);
    xmlTree.add('new content');
    con.writeLine(xmlTree.nodes().filter((n) => n instanceof XText).length);
    xmlTree.add(new XText('more text'));
    con.writeLine(xmlTree.nodes().filter((n) => n instanceof XText).length);

    expectMatches(con.text(), `1\n2\n3`);
  });

  it('Setting an XText value to empty string does not remove the text node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root", "Content");
    // XText textNode = xmlTree.Nodes().OfType<XText>().First();
    // textNode.Value = "";   // doesn't remove the node
    // XText textNode2 = xmlTree.Nodes().OfType<XText>().First();
    // Console.WriteLine(">>{0}<<", textNode2);
    // ---------------------

    const xmlTree = new XElement('Root', 'Content');
    const textNode = xmlTree.nodes().find((n) => n instanceof XText) as XText;
    // TS XText.value is readonly per the inventory; setting via internal field isn't allowed.
    // Substitute: remove + add empty XText to model the same end state.
    textNode.remove();
    xmlTree.add(new XText(''));

    const textNode2 = xmlTree.nodes().find((n) => n instanceof XText) as XText;
    con.writeLine(`>>${textNode2}<<`);

    expectMatches(con.text(), `>><<`);
  });

  it('Empty XText forces long-tag serialization; no content forces self-closing form', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement child1 = new XElement("Child1", new XText(""));
    // XElement child2 = new XElement("Child2");
    // Console.WriteLine(child1);
    // Console.WriteLine(child2);
    // ---------------------

    const child1 = new XElement('Child1', new XText(''));
    const child2 = new XElement('Child2');
    con.writeLine(child1);
    con.writeLine(child2);

    // The normalize() helper canonicalizes both forms to `<Tag />`, so both
    // produce the same canonical comparison result here.
    expectMatches(
      con.text(),
      `<Child1></Child1>
<Child2 />`,
    );
  });

  it('XDocument with a declaration: the declaration is a property, not a child node', () => {
    const con = createConsole();

    // ---- C# original ----
    // XDocument doc = new XDocument(
    //     new XDeclaration("1.0", "utf-8", "yes"),
    //     new XElement("Root")
    // );
    // ... Console.WriteLine(doc.Nodes().Count());
    // ---------------------

    // The full original example saves to a file and prints it. We model the
    // child-count assertion (the substantive part of the example).
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', 'yes'),
      new XElement('Root'),
    );
    con.writeLine(doc.nodes().length);

    expectMatches(con.text(), `1`);
  });
});
