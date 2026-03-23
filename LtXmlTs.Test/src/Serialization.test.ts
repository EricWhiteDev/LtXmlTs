/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Serialization.test.ts
// Tests XML serialization across the full LtXmlTs API, including elements, attributes,
// namespaces, prefixes, declarations, comments, processing instructions, and mixed content.
// These tests are not scoped to any single class — they exercise the serialization pipeline
// end-to-end and serve as the authoritative specification for serialized XML output.

import { describe, it, expect } from 'vitest';
import {
  XmlNodeType,
  XObject,
  XNode,
  XComment,
  XText,
  XEntity,
  XCData,
  XProcessingInstruction,
  XContainer,
  XAttribute,
  XElement,
  XDeclaration,
  XDocument,
  XNamespace,
  XName,
} from 'ltxmlts';

describe('Serialization', () => {

  it('Basic serialization', () => {
    const parent = new XElement('root',
      new XElement('child', 'hello')
    );
    expect(parent.toString()).toBe(`<root><child>hello</child></root>`);
  });

  it('Serialization with namespace and prefix', () => {
    const w = new XNamespace('urn:www');
    const parent = new XElement(w + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:www'),
      new XAttribute('foo', 'bar'),
      new XElement(w + 'child', 'hello')
    );
    expect(parent.toString()).toBe(`<w:root xmlns:w='urn:www' foo='bar'><w:child>hello</w:child></w:root>`);
  });

  it('auto-generates a p# prefix for an element in an undeclared namespace', () => {
    const foo = new XNamespace('urn:test:autogen:element');
    const root = new XElement(foo + 'root');
    expect(root.toString()).toBe("<p0:root xmlns:p0='urn:test:autogen:element' />");
  });

  it('auto-generates a p# prefix for an attribute in an undeclared namespace', () => {
    const bar = new XNamespace('urn:test:autogen:attr');
    const root = new XElement('root',
      new XAttribute(bar + 'lang', 'en')
    );
    expect(root.toString()).toBe("<root p0:lang='en' xmlns:p0='urn:test:autogen:attr' />");
  });

  it('auto-generates distinct p# prefixes for element and attribute in different undeclared namespaces', () => {
    const ns1 = new XNamespace('urn:test:autogen:multi1');
    const ns2 = new XNamespace('urn:test:autogen:multi2');
    const root = new XElement(ns1 + 'root',
      new XAttribute(ns2 + 'attr', 'val')
    );
    expect(root.toString()).toBe(
      "<p1:root p0:attr='val' xmlns:p0='urn:test:autogen:multi2' xmlns:p1='urn:test:autogen:multi1' />"
    );
  });

  it('generates only one p# declaration when element and attribute share the same undeclared namespace', () => {
    const ns = new XNamespace('urn:test:autogen:shared');
    const root = new XElement(ns + 'root',
      new XAttribute(ns + 'attr', 'val')
    );
    expect(root.toString()).toBe(
      "<p0:root p0:attr='val' xmlns:p0='urn:test:autogen:shared' />"
    );
  });

  it('calling toString() twice produces the same result after cleanup', () => {
    const foo = new XNamespace('urn:test:autogen:idempotent');
    const root = new XElement(foo + 'root');
    const first = root.toString();
    const second = root.toString();
    expect(first).toBe(second);
  });

  it('pHashCount resets between independent serializations', () => {
    // Two separate elements in the same undeclared namespace, serialized independently.
    // Without the try/finally fix, a previous exception (or even just prior calls that bump
    // pHashCount) could cause the second element to use p1 instead of p0.
    // This test verifies that pHashCount is always reset so both produce identical output.
    const ns = new XNamespace('urn:test:phash-reset');
    const s1 = new XElement(ns + 'root').toString();
    const s2 = new XElement(ns + 'root').toString();
    expect(s1).toBe(s2);
  });

  it('pHashCount is reset even when toStringInternal throws', () => {
    // Monkey-patch toStringInternal on an element to simulate a mid-serialization throw,
    // then verify that a subsequent normal serialization still starts from p0.
    const ns = new XNamespace('urn:test:phash-exception');
    const bad = new XElement(ns + 'bad');
    (bad as any).toStringInternal = () => { throw new Error('simulated'); };
    expect(() => bad.toString()).toThrow('simulated');

    // After the exception, a fresh element in the same namespace should still get p0.
    const good = new XElement(ns + 'good');
    expect(good.toString()).toBe("<p0:good xmlns:p0='urn:test:phash-exception' />");
  });

  it('prefix collision in child does not corrupt parent element prefix', () => {
    // Parent declares xmlns:w for urn:collision-test:parent.
    // Child re-declares the same prefix w for a different namespace, triggering the collision
    // path in populateNamespacePrefixInfoRecurse. Before the fix, the shallow-copied
    // NamespacePrefixPair was shared, so mutating its prefix bled into the parent's info,
    // causing the parent element to serialize with the wrong prefix.
    const urnParent = new XNamespace('urn:collision-test:parent');
    const root = new XElement(urnParent + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:collision-test:parent'),
      new XElement('child',
        new XAttribute(XNamespace.xmlns + 'w', 'urn:collision-test:child')
      )
    );
    expect(root.toString()).toBe(
      "<w:root xmlns:w='urn:collision-test:parent'><child xmlns:w='urn:collision-test:child' /></w:root>"
    );
  });

});

describe('Default namespace serialization', () => {
  it('element in its own declared default namespace renders without prefix', () => {
    const ns = new XNamespace('urn:default:self');
    const root = new XElement(ns + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:default:self')
    );
    expect(root.toString()).toBe("<root xmlns='urn:default:self' />");
  });

  it('child element in inherited default namespace renders without prefix', () => {
    const ns = new XNamespace('urn:default:child');
    const root = new XElement(ns + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:default:child'),
      new XElement(ns + 'child')
    );
    expect(root.toString()).toBe("<root xmlns='urn:default:child'><child /></root>");
  });

  it('element not in default namespace still gets a p# prefix', () => {
    const defNs = new XNamespace('urn:default:mixed-def');
    const otherNs = new XNamespace('urn:default:mixed-other');
    const root = new XElement(defNs + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:default:mixed-def'),
      new XElement(otherNs + 'child')
    );
    // root is in default ns (no prefix); child is in a different ns (gets p#)
    expect(root.toString()).toBe(
      "<root xmlns='urn:default:mixed-def'><p0:child xmlns:p0='urn:default:mixed-other' /></root>"
    );
  });

  it('serializing a default-namespace tree twice produces identical output', () => {
    const ns = new XNamespace('urn:default:idempotent');
    const root = new XElement(ns + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:default:idempotent'),
      new XElement(ns + 'child')
    );
    expect(root.toString()).toBe(root.toString());
  });
});

describe('toStringWithIndentation', () => {
  it('formats a nested element tree with 2-space indentation', () => {
    const root = new XElement('root',
      new XElement('child', 'hello')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <child>hello</child>
</root>`
    );
  });

  it('formats a self-closing element on one line', () => {
    const root = new XElement('root',
      new XElement('empty')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <empty />
</root>`
    );
  });

  it('formats XDocument with declaration', () => {
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', ''),
      new XElement('root', new XElement('child'))
    );
    expect(doc.toStringWithIndentation()).toBe(
`<?xml version='1.0' encoding='utf-8'?>
<root>
  <child />
</root>`
    );
  });

  it('formats a comment node', () => {
    const root = new XElement('root',
      new XComment('hello')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <!--hello-->
</root>`
    );
  });

  it('formats a processing instruction', () => {
    const root = new XElement('root',
      new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <?xml-stylesheet type="text/css"?>
</root>`
    );
  });

  it('calling toStringWithIndentation() twice produces the same result', () => {
    const root = new XElement('root', new XElement('child'));
    expect(root.toStringWithIndentation()).toBe(root.toStringWithIndentation());
  });

  it('text-only element is not split across lines', () => {
    const root = new XElement('root',
      new XElement('a', 'first'),
      new XElement('b', 'second')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <a>first</a>
  <b>second</b>
</root>`
    );
  });

  it('mixed-content element is kept compact', () => {
    const root = new XElement('root',
      new XElement('p',
        new XText('Hello '),
        new XElement('b', 'world')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <p>Hello <b>world</b></p>
</root>`
    );
  });

  it('deeply nested text-only elements are each on one line', () => {
    const root = new XElement('root',
      new XElement('section',
        new XElement('para', 'text')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <section>
    <para>text</para>
  </section>
</root>`
    );
  });

  it('mixed-content subtree is emitted fully compact', () => {
    const root = new XElement('root',
      new XElement('outer',
        new XText('before'),
        new XElement('inner', 'inside'),
        new XText('after')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <outer>before<inner>inside</inner>after</outer>
</root>`
    );
  });

  it('attributes on elements at every nesting level', () => {
    const root = new XElement('root', new XAttribute('lang', 'en'),
      new XElement('section', new XAttribute('id', '1'),
        new XElement('para', new XAttribute('class', 'intro'), 'Hello')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root lang='en'>
  <section id='1'>
    <para class='intro'>Hello</para>
  </section>
</root>`
    );
  });

  it('attributes on deep element with self-closing leaf', () => {
    const root = new XElement('root', new XAttribute('id', '1'),
      new XElement('item', new XAttribute('type', 'widget'), new XAttribute('active', 'true'),
        new XElement('name', 'foo')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root id='1'>
  <item type='widget' active='true'>
    <name>foo</name>
  </item>
</root>`
    );
  });

  it('four levels of element-only nesting', () => {
    const root = new XElement('a',
      new XElement('b',
        new XElement('c',
          new XElement('d')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<a>
  <b>
    <c>
      <d />
    </c>
  </b>
</a>`
    );
  });

  it('five levels deep with attribute on innermost element', () => {
    const root = new XElement('l1',
      new XElement('l2',
        new XElement('l3',
          new XElement('l4',
            new XElement('l5', new XAttribute('x', 'y'))
          )
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<l1>
  <l2>
    <l3>
      <l4>
        <l5 x='y' />
      </l4>
    </l3>
  </l2>
</l1>`
    );
  });

  it('comments at root level and nested level', () => {
    const root = new XElement('root',
      new XComment('top level comment'),
      new XElement('child',
        new XComment('nested comment'),
        new XElement('leaf')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <!--top level comment-->
  <child>
    <!--nested comment-->
    <leaf />
  </child>
</root>`
    );
  });

  it('processing instructions at root level and nested level', () => {
    const root = new XElement('root',
      new XProcessingInstruction('app', 'init'),
      new XElement('child',
        new XProcessingInstruction('nested', 'value'),
        new XElement('leaf', 'content')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <?app init?>
  <child>
    <?nested value?>
    <leaf>content</leaf>
  </child>
</root>`
    );
  });

  it('mixed content at child level alongside element-only siblings', () => {
    const root = new XElement('article',
      new XElement('p',
        new XText('Text with '),
        new XElement('em', 'emphasis'),
        new XText(' inline')
      ),
      new XElement('aside',
        new XElement('note', 'side note')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<article>
  <p>Text with <em>emphasis</em> inline</p>
  <aside>
    <note>side note</note>
  </aside>
</article>`
    );
  });

  it('mixed content deeply nested inside element-only ancestors', () => {
    const root = new XElement('root',
      new XElement('outer',
        new XElement('inner',
          new XText('text with '),
          new XElement('b', 'bold')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <outer>
    <inner>text with <b>bold</b></inner>
  </outer>
</root>`
    );
  });

  it('namespace-prefixed elements at multiple nesting levels', () => {
    const w = new XNamespace('urn:test');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:test'),
      new XElement(w + 'child',
        new XElement(w + 'leaf')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<w:root xmlns:w='urn:test'>
  <w:child>
    <w:leaf />
  </w:child>
</w:root>`
    );
  });

  it('mixed text-only and element-only siblings at multiple depths', () => {
    const root = new XElement('root',
      new XElement('header', 'Title'),
      new XElement('body',
        new XElement('section',
          new XElement('p', 'Paragraph one'),
          new XElement('p', 'Paragraph two')
        )
      ),
      new XElement('footer', 'End')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <header>Title</header>
  <body>
    <section>
      <p>Paragraph one</p>
      <p>Paragraph two</p>
    </section>
  </body>
  <footer>End</footer>
</root>`
    );
  });
});
