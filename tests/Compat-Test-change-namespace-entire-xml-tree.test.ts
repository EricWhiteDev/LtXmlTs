/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to change the namespace for an entire XML tree".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/change-namespace-entire-xml-tree

import { describe, it } from 'vitest';
import { XAttribute, XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Change the namespace for an entire XML tree (conceptual)', () => {
  it('Set XElement.name on every descendant to rebrand the entire tree into a new namespace', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement tree1 = new XElement("Data",
    //     new XElement("Child", "content", new XAttribute("MyAttr", "content"))
    // );
    // XElement tree2 = new XElement("Data",
    //     new XElement("Child", "content", new XAttribute("MyAttr", "content"))
    // );
    // XNamespace aw = "http://www.adventure-works.com";
    // XNamespace ad = "http://www.adatum.com";
    // foreach (XElement el in tree1.DescendantsAndSelf()) {
    //     el.Name = aw.GetName(el.Name.LocalName);
    //     List<XAttribute> atList = el.Attributes().ToList();
    //     el.Attributes().Remove();
    //     foreach (XAttribute at in atList)
    //         el.Add(new XAttribute(aw.GetName(at.Name.LocalName), at.Value));
    // }
    // // ... same loop for tree2 with ad ...
    // tree1.Add(new XAttribute(XNamespace.Xmlns + "aw", "http://www.adventure-works.com"));
    // tree2.Add(new XAttribute(XNamespace.Xmlns + "ad", "http://www.adatum.com"));
    // XElement root = new XElement("Root", tree1, tree2);
    // Console.WriteLine(root);
    // ---------------------

    const tree1 = new XElement(
      'Data',
      new XElement('Child', 'content', new XAttribute('MyAttr', 'content')),
    );
    const tree2 = new XElement(
      'Data',
      new XElement('Child', 'content', new XAttribute('MyAttr', 'content')),
    );

    const aw = XNamespace.get('http://www.adventure-works.com');
    const ad = XNamespace.get('http://www.adatum.com');

    for (const el of tree1.descendantsAndSelf()) {
      el.name = aw.getName(el.name.localName);
      const atList = [...el.attributes()];
      for (const at of atList) at.remove();
      for (const at of atList) {
        el.add(new XAttribute(aw.getName(at.name.localName), at.value));
      }
    }
    for (const el of tree2.descendantsAndSelf()) {
      el.name = ad.getName(el.name.localName);
      const atList = [...el.attributes()];
      for (const at of atList) at.remove();
      for (const at of atList) {
        el.add(new XAttribute(ad.getName(at.name.localName), at.value));
      }
    }

    tree1.add(
      new XAttribute(XNamespace.xmlns + 'aw', 'http://www.adventure-works.com'),
    );
    tree2.add(
      new XAttribute(XNamespace.xmlns + 'ad', 'http://www.adatum.com'),
    );

    const root = new XElement('Root', tree1, tree2);
    con.writeLine(root);

    expectMatches(
      con.text(),
      `<Root>
  <aw:Data xmlns:aw="http://www.adventure-works.com">
    <aw:Child aw:MyAttr="content">content</aw:Child>
  </aw:Data>
  <ad:Data xmlns:ad="http://www.adatum.com">
    <ad:Child ad:MyAttr="content">content</ad:Child>
  </ad:Data>
</Root>`,
    );
  });
});
