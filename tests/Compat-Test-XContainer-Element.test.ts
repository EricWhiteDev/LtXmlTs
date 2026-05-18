/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XContainer.Element(XName) method reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer.element?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XContainer.Element(XName)', () => {
  it('returns the first matching child, or null (passing null as content is silently ignored)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement srcTree = new XElement("Root",
    //     new XElement("Element1", 1), ..., new XElement("Element5", 5));
    // XElement xmlTree = new XElement("Root",
    //     new XElement("Child1", 1), ..., new XElement("Child5", 5),
    //     srcTree.Element("Element3"),
    //     srcTree.Element("Element9")  // null — no exception, no child added
    // );
    // Console.WriteLine(xmlTree);
    // ---------------------

    const srcTree = new XElement(
      'Root',
      new XElement('Element1', 1),
      new XElement('Element2', 2),
      new XElement('Element3', 3),
      new XElement('Element4', 4),
      new XElement('Element5', 5),
    );
    const xmlTree = new XElement(
      'Root',
      new XElement('Child1', 1),
      new XElement('Child2', 2),
      new XElement('Child3', 3),
      new XElement('Child4', 4),
      new XElement('Child5', 5),
      srcTree.element('Element3'),
      srcTree.element('Element9'),
    );
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<Root>
  <Child1>1</Child1>
  <Child2>2</Child2>
  <Child3>3</Child3>
  <Child4>4</Child4>
  <Child5>5</Child5>
  <Element3>3</Element3>
</Root>`,
    );
  });

  it('same example in a namespace', () => {
    const con = createConsole();

    // ---- C# original (namespace variant) ----
    // (analogous to above with XNamespace aw)
    // -----------------------------------------

    const aw = XNamespace.get('http://www.adventure-works.com');
    const srcTree = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XElement(aw + 'Element1', 1),
      new XElement(aw + 'Element2', 2),
      new XElement(aw + 'Element3', 3),
      new XElement(aw + 'Element4', 4),
      new XElement(aw + 'Element5', 5),
    );
    const xmlTree = new XElement(
      aw + 'Root',
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
      new XElement(aw + 'Child1', 1),
      new XElement(aw + 'Child2', 2),
      new XElement(aw + 'Child3', 3),
      new XElement(aw + 'Child4', 4),
      new XElement(aw + 'Child5', 5),
      srcTree.element(aw + 'Element3'),
      srcTree.element(aw + 'Element9'),
    );
    con.writeLine(xmlTree);

    expectMatches(
      con.text(),
      `<aw:Root xmlns:aw="http://www.adventure-works.com">
  <aw:Child1>1</aw:Child1>
  <aw:Child2>2</aw:Child2>
  <aw:Child3>3</aw:Child3>
  <aw:Child4>4</aw:Child4>
  <aw:Child5>5</aw:Child5>
  <aw:Element3>3</aw:Element3>
</aw:Root>`,
    );
  });
});
