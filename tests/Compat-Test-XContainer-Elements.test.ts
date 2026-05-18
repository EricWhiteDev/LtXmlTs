/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from XContainer.Elements method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.elements?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.Elements', () => {
  // COMPAT: substituted — C# `(int)el` is replaced with `Number(el.value)`.
  it('Elements() yields all child elements, supports filtering via JS coercion', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", 1), new XElement("Child2", 2),
    //     new XElement("Child3", 3), new XElement("Child4", 4),
    //     new XElement("Child5", 5)
    // );
    // foreach (XElement el in xmlTree.Elements().Where(el => (int)el <= 3))
    //     Console.WriteLine(el);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XElement('Child3', 3),
      new XElement('Child4', 4),
      new XElement('Child5', 5),
    );
    for (const el of xmlTree.elements().filter((el) => Number(el.value) <= 3)) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `<Child1>1</Child1>
<Child2>2</Child2>
<Child3>3</Child3>`,
    );
  });

  it('Elements(XName) yields only matching children', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Type1", 1), new XElement("Type1", 2),
    //     new XElement("Type2", 3), new XElement("Type2", 4),
    //     new XElement("Type2", 5)
    // );
    // foreach (XElement el in xmlTree.Elements("Type2"))
    //     Console.WriteLine(el);
    // ---------------------

    const xmlTree = new XElement(
      'Root',
      new XElement('Type1', 1),
      new XElement('Type1', 2),
      new XElement('Type2', 3),
      new XElement('Type2', 4),
      new XElement('Type2', 5),
    );
    for (const el of xmlTree.elements('Type2')) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `<Type2>3</Type2>
<Type2>4</Type2>
<Type2>5</Type2>`,
    );
  });

  // COMPAT: substituted — C# `(int)el` is replaced with `Number(el.value)`.
  // COMPAT (port behavior, intentional): .NET's XNode.ToString() on a child
  // element re-emits the inherited `xmlns:aw="..."` declaration so the
  // standalone serialization is well-formed; the TS port omits the inherited
  // declaration. Expected output adjusted to the port's emission.
  it('Elements() works in a namespace; each printed element does not re-declare the inherited namespace', () => {
    const con = createConsole();

    // ---- C# original (namespace variant) ----
    // XNamespace aw = "http://www.adventure-works.com";
    // XElement xmlTree = new XElement(aw + "Root",
    //     new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"),
    //     new XElement(aw + "Child1", 1), ..., new XElement(aw + "Child5", 5)
    // );
    // foreach (XElement el in xmlTree.Elements().Where(el => (int)el <= 3))
    //     Console.WriteLine(el);
    // -----------------------------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const xmlTree = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XElement(aw + 'Child1', 1),
      new XElement(aw + 'Child2', 2),
      new XElement(aw + 'Child3', 3),
      new XElement(aw + 'Child4', 4),
      new XElement(aw + 'Child5', 5),
    );
    for (const el of xmlTree.elements().filter((el) => Number(el.value) <= 3)) {
      con.writeLine(el);
    }

    expectMatches(
      con.text(),
      `<aw:Child1>1</aw:Child1>
<aw:Child2>2</aw:Child2>
<aw:Child3>3</aw:Child3>`,
    );
  });
});
