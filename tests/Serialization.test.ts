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
      "<w:root xmlns:w='urn:collision-test:parent'><child xmlns:w='urn:collision-test:child' xmlns:p0='urn:collision-test:parent' /></w:root>"
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

  it('two explicit namespaces nested two levels', () => {
    const w = new XNamespace('urn:w');
    const x = new XNamespace('urn:x');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(x + 'child', new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
        new XElement(w + 'leaf')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<w:root xmlns:w='urn:w'>
  <x:child xmlns:x='urn:x'>
    <w:leaf />
  </x:child>
</w:root>`
    );
  });

  it('explicit namespace declared at root used in no-namespace grandchild sibling', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement('plain',
        new XElement(ns + 'inner')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<ns:root xmlns:ns='urn:ns'>
  <plain>
    <ns:inner />
  </plain>
</ns:root>`
    );
  });

  it('namespace used in both element name and attribute', () => {
    const w = new XNamespace('urn:w');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(w + 'item', new XAttribute(w + 'id', '1'), new XAttribute('name', 'foo'))
    );
    expect(root.toStringWithIndentation()).toBe(
`<w:root xmlns:w='urn:w'>
  <w:item w:id='1' name='foo' />
</w:root>`
    );
  });

  it('two namespaces declared at root used at different depths', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'root',
      new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
      new XElement(a + 'section',
        new XElement(b + 'item', 'value')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<a:root xmlns:a='urn:a' xmlns:b='urn:b'>
  <a:section>
    <b:item>value</b:item>
  </a:section>
</a:root>`
    );
  });

  it('three levels each with a different explicit prefix', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const c = new XNamespace('urn:c');
    const root = new XElement(a + 'root', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(b + 'section', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(c + 'item', new XAttribute(XNamespace.xmlns + 'c', 'urn:c'), 'text')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<a:root xmlns:a='urn:a'>
  <b:section xmlns:b='urn:b'>
    <c:item xmlns:c='urn:c'>text</c:item>
  </b:section>
</a:root>`
    );
  });

  it('single explicit namespace used four levels deep', () => {
    const w = new XNamespace('urn:w');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(w + 'body',
        new XElement(w + 'section', new XAttribute('id', '1'),
          new XElement(w + 'para', 'text')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<w:root xmlns:w='urn:w'>
  <w:body>
    <w:section id='1'>
      <w:para>text</w:para>
    </w:section>
  </w:body>
</w:root>`
    );
  });

  it('no-namespace root with children each in their own explicitly declared namespace', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement('root',
      new XElement(a + 'header', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'), 'Title'),
      new XElement(b + 'body', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(a + 'para', 'content')
      )
    );
    // a:para inside b:body — 'a' is not in scope there, gets p0
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <a:header xmlns:a='urn:a'>Title</a:header>
  <b:body xmlns:b='urn:b'>
    <p0:para xmlns:p0='urn:a'>content</p0:para>
  </b:body>
</root>`
    );
  });

  it('five levels alternating between two explicit namespaces', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'l1', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(b + 'l2', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(a + 'l3',
          new XElement(b + 'l4',
            new XElement(a + 'l5')
          )
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<a:l1 xmlns:a='urn:a'>
  <b:l2 xmlns:b='urn:b'>
    <a:l3>
      <b:l4>
        <a:l5 />
      </b:l4>
    </a:l3>
  </b:l2>
</a:l1>`
    );
  });

  it('root declares two namespaces, deep descendant uses both in one element', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement('root',
      new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
      new XElement('section',
        new XElement('row',
          new XElement(a + 'cell', new XAttribute(b + 'type', 'header'), 'text')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns:a='urn:a' xmlns:b='urn:b'>
  <section>
    <row>
      <a:cell b:type='header'>text</a:cell>
    </row>
  </section>
</root>`
    );
  });

  it('explicit namespace with attributes in both namespace and no-namespace at multiple levels', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'item',
        new XAttribute('class', 'primary'),
        new XAttribute(ns + 'id', '1'),
        new XElement(ns + 'name', new XAttribute('lang', 'en'), 'World')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<ns:root xmlns:ns='urn:ns'>
  <ns:item class='primary' ns:id='1'>
    <ns:name lang='en'>World</ns:name>
  </ns:item>
</ns:root>`
    );
  });

  it('all elements share one undeclared namespace — single p0 throughout', () => {
    const ns = new XNamespace('urn:ex');
    const root = new XElement(ns + 'root',
      new XElement(ns + 'child',
        new XElement(ns + 'leaf')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<p0:root xmlns:p0='urn:ex'>
  <p0:child>
    <p0:leaf />
  </p0:child>
</p0:root>`
    );
  });

  it('undeclared namespace on attribute only — p0 on attribute, element has no prefix', () => {
    const attr_ns = new XNamespace('urn:attr');
    const root = new XElement('root',
      new XElement('item',
        new XAttribute(attr_ns + 'type', 'primary')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <item p0:type='primary' xmlns:p0='urn:attr' />
</root>`
    );
  });

  it('element and attribute in different undeclared namespaces — attr gets p0, element gets p1', () => {
    const el_ns = new XNamespace('urn:el');
    const at_ns = new XNamespace('urn:at');
    const root = new XElement('root',
      new XElement(el_ns + 'item',
        new XAttribute(at_ns + 'id', '1')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <p1:item p0:id='1' xmlns:p0='urn:at' xmlns:p1='urn:el' />
</root>`
    );
  });

  it('element and attribute share the same undeclared namespace — single p0', () => {
    const ns = new XNamespace('urn:shared');
    const root = new XElement('root',
      new XElement(ns + 'item',
        new XAttribute(ns + 'id', '42')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <p0:item p0:id='42' xmlns:p0='urn:shared' />
</root>`
    );
  });

  it('explicit-prefix parent, undeclared-namespace child gets p0', () => {
    const outer = new XNamespace('urn:outer');
    const inner = new XNamespace('urn:inner');
    const root = new XElement(outer + 'root', new XAttribute(XNamespace.xmlns + 'outer', 'urn:outer'),
      new XElement(inner + 'child')
    );
    expect(root.toStringWithIndentation()).toBe(
`<outer:root xmlns:outer='urn:outer'>
  <p0:child xmlns:p0='urn:inner' />
</outer:root>`
    );
  });

  it('undeclared namespace at depth 3 with no-namespace ancestors', () => {
    const ns = new XNamespace('urn:deep');
    const root = new XElement('root',
      new XElement('level1',
        new XElement('level2',
          new XElement(ns + 'leaf', new XAttribute('x', 'y'))
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <level1>
    <level2>
      <p0:leaf x='y' xmlns:p0='urn:deep' />
    </level2>
  </level1>
</root>`
    );
  });

  it('two undeclared attribute namespaces and one undeclared element namespace — p0 p1 p2', () => {
    const ns1 = new XNamespace('urn:ns1');
    const ns2 = new XNamespace('urn:ns2');
    const ns3 = new XNamespace('urn:ns3');
    const root = new XElement('root',
      new XElement('section',
        new XElement(ns1 + 'item',
          new XAttribute(ns2 + 'type', 'a'),
          new XAttribute(ns3 + 'lang', 'en')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <section>
    <p2:item p0:type='a' p1:lang='en' xmlns:p0='urn:ns2' xmlns:p1='urn:ns3' xmlns:p2='urn:ns1' />
  </section>
</root>`
    );
  });

  it('auto-generated p# prefix inside a compact mixed-content subtree', () => {
    const ns = new XNamespace('urn:em');
    const root = new XElement('root',
      new XElement('para',
        new XText('See '),
        new XElement(ns + 'em', 'note'),
        new XText(' below')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <para>See <p0:em xmlns:p0='urn:em'>note</p0:em> below</para>
</root>`
    );
  });

  it('default namespace declared at root, children inherit it', () => {
    const ns = new XNamespace('urn:def');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(ns + 'child', new XAttribute('id', '1'),
        new XElement(ns + 'leaf')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:def'>
  <child id='1'>
    <leaf />
  </child>
</root>`
    );
  });

  it('default namespace with text-only leaves at depth 3', () => {
    const ns = new XNamespace('urn:html');
    const root = new XElement(ns + 'html', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:html'),
      new XElement(ns + 'body',
        new XElement(ns + 'p', 'Hello world')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<html xmlns='urn:html'>
  <body>
    <p>Hello world</p>
  </body>
</html>`
    );
  });

  it('default namespace at root, child in explicit-prefix namespace, grandchild back in default', () => {
    const defNs = new XNamespace('urn:def');
    const xNs = new XNamespace('urn:x');
    const root = new XElement(defNs + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(xNs + 'special', new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
        new XElement(defNs + 'normal', 'content')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:def'>
  <x:special xmlns:x='urn:x'>
    <normal>content</normal>
  </x:special>
</root>`
    );
  });

  it('default namespace at root, deeply nested no-namespace element', () => {
    const ns = new XNamespace('urn:doc');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:doc'),
      new XElement(ns + 'body',
        new XElement(ns + 'section',
          new XElement('raw')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:doc'>
  <body>
    <section>
      <raw />
    </section>
  </body>
</root>`
    );
  });

  it('child redeclares default namespace to a different URI', () => {
    const ns1 = new XNamespace('urn:ns1');
    const ns2 = new XNamespace('urn:ns2');
    const root = new XElement(ns1 + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns1'),
      new XElement(ns2 + 'sub', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns2'),
        new XElement(ns2 + 'item', 'text')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:ns1'>
  <sub xmlns='urn:ns2'>
    <item>text</item>
  </sub>
</root>`
    );
  });

  it('default namespace declared at a nested level, parent element is in no namespace', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement('root', new XAttribute('version', '1.0'),
      new XElement(ns + 'data', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns'),
        new XElement(ns + 'record', new XAttribute('id', '1'), 'value')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root version='1.0'>
  <data xmlns='urn:ns'>
    <record id='1'>value</record>
  </data>
</root>`
    );
  });

  it('default namespace with attributes only in no-namespace', () => {
    const ns = new XNamespace('urn:form');
    const root = new XElement(ns + 'form', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:form'),
      new XElement(ns + 'field',
        new XAttribute('name', 'email'),
        new XAttribute('required', 'true'),
        new XElement(ns + 'label', 'Email address')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<form xmlns='urn:form'>
  <field name='email' required='true'>
    <label>Email address</label>
  </field>
</form>`
    );
  });

  it('default namespace with mixed content', () => {
    const ns = new XNamespace('urn:doc');
    const root = new XElement(ns + 'doc', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:doc'),
      new XElement(ns + 'p',
        new XText('Hello '),
        new XElement(ns + 'em', 'world')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<doc xmlns='urn:doc'>
  <p>Hello <em>world</em></p>
</doc>`
    );
  });

  it('foreign element in default-namespace tree gets auto p# prefix', () => {
    const defNs = new XNamespace('urn:def');
    const extNs = new XNamespace('urn:ext');
    const root = new XElement(defNs + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(defNs + 'section',
        new XElement(extNs + 'foreign')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:def'>
  <section>
    <p0:foreign xmlns:p0='urn:ext' />
  </section>
</root>`
    );
  });

  it('mixed content with explicit-prefix inline element', () => {
    const doc = new XNamespace('urn:doc');
    const hl = new XNamespace('urn:hl');
    const root = new XElement(doc + 'root', new XAttribute(XNamespace.xmlns + 'doc', 'urn:doc'),
      new XElement(doc + 'para',
        new XText('Click '),
        new XElement(hl + 'link', new XAttribute(XNamespace.xmlns + 'hl', 'urn:hl'), 'here'),
        new XText(' to continue')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<doc:root xmlns:doc='urn:doc'>
  <doc:para>Click <hl:link xmlns:hl='urn:hl'>here</hl:link> to continue</doc:para>
</doc:root>`
    );
  });

  it('default-namespace tree with mixed content containing auto-p# foreign inline element', () => {
    const def = new XNamespace('urn:def');
    const ext = new XNamespace('urn:ext');
    const root = new XElement(def + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(def + 'para',
        new XText('See '),
        new XElement(ext + 'ref', 'item'),
        new XText(' below')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:def'>
  <para>See <p0:ref xmlns:p0='urn:ext'>item</p0:ref> below</para>
</root>`
    );
  });

  it('mixed content at depth 3 inside namespace tree from parent scope', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'root', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(a + 'section',
        new XElement(b + 'para', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
          new XText('Start '),
          new XElement(a + 'em', 'text'),
          new XText(' end')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<a:root xmlns:a='urn:a'>
  <a:section>
    <b:para xmlns:b='urn:b'>Start <a:em>text</a:em> end</b:para>
  </a:section>
</a:root>`
    );
  });

  it('comment at depth 4 inside a namespaced element tree', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'a',
        new XElement(ns + 'b',
          new XComment('deep comment'),
          new XElement(ns + 'c')
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<ns:root xmlns:ns='urn:ns'>
  <ns:a>
    <ns:b>
      <!--deep comment-->
      <ns:c />
    </ns:b>
  </ns:a>
</ns:root>`
    );
  });

  it('processing instruction at depth 3 inside a namespaced element tree', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'body',
        new XProcessingInstruction('app', 'mode=edit'),
        new XElement(ns + 'content', 'data')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<ns:root xmlns:ns='urn:ns'>
  <ns:body>
    <?app mode=edit?>
    <ns:content>data</ns:content>
  </ns:body>
</ns:root>`
    );
  });

  it('XDocument with declaration and namespaced root element', () => {
    const ns = new XNamespace('urn:app');
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', ''),
      new XElement(ns + 'app', new XAttribute(XNamespace.xmlns + 'ns', 'urn:app'),
        new XElement(ns + 'config',
          new XElement(ns + 'setting', new XAttribute('key', 'debug'), 'true')
        )
      )
    );
    expect(doc.toStringWithIndentation()).toBe(
`<?xml version='1.0' encoding='utf-8'?>
<ns:app xmlns:ns='urn:app'>
  <ns:config>
    <ns:setting key='debug'>true</ns:setting>
  </ns:config>
</ns:app>`
    );
  });

  it('multiple namespace declarations at root, attributes use both at nested level', () => {
    const w = new XNamespace('urn:w');
    const m = new XNamespace('urn:m');
    const root = new XElement('root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XAttribute(XNamespace.xmlns + 'm', 'urn:m'),
      new XElement('row',
        new XAttribute(w + 'align', 'left'),
        new XAttribute(m + 'color', 'red'),
        new XElement('cell', new XAttribute('span', '2'), 'data')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns:w='urn:w' xmlns:m='urn:m'>
  <row w:align='left' m:color='red'>
    <cell span='2'>data</cell>
  </row>
</root>`
    );
  });

  it('default namespace and explicit prefix declared at root, siblings use each', () => {
    const def = new XNamespace('urn:def');
    const x = new XNamespace('urn:x');
    const root = new XElement(def + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
      new XElement(def + 'a', 'first'),
      new XElement(x + 'b', 'second'),
      new XElement(def + 'c', 'third')
    );
    expect(root.toStringWithIndentation()).toBe(
`<root xmlns='urn:def' xmlns:x='urn:x'>
  <a>first</a>
  <x:b>second</x:b>
  <c>third</c>
</root>`
    );
  });

  it('namespace prefix declared at a middle level, used in descendants', () => {
    const ns = new XNamespace('urn:mid');
    const root = new XElement('root',
      new XElement('outer',
        new XElement(ns + 'middle', new XAttribute(XNamespace.xmlns + 'mid', 'urn:mid'),
          new XElement(ns + 'inner',
            new XElement(ns + 'leaf', 'text')
          )
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <outer>
    <mid:middle xmlns:mid='urn:mid'>
      <mid:inner>
        <mid:leaf>text</mid:leaf>
      </mid:inner>
    </mid:middle>
  </outer>
</root>`
    );
  });

  it('no-namespace elements alternate with namespaced elements at multiple depths', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement('plain1',
        new XElement(ns + 'ns-child',
          new XElement('plain2',
            new XElement(ns + 'leaf')
          )
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<ns:root xmlns:ns='urn:ns'>
  <plain1>
    <ns:ns-child>
      <plain2>
        <ns:leaf />
      </plain2>
    </ns:ns-child>
  </plain1>
</ns:root>`
    );
  });

  it('auto-p# attribute namespace and auto-p# element namespace at depth 3', () => {
    const ns1 = new XNamespace('urn:attr1');
    const ns2 = new XNamespace('urn:elem1');
    const root = new XElement('root',
      new XElement('a',
        new XElement('b',
          new XElement(ns2 + 'leaf',
            new XAttribute(ns1 + 'id', 'x')
          )
        )
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<root>
  <a>
    <b>
      <p1:leaf p0:id='x' xmlns:p0='urn:attr1' xmlns:p1='urn:elem1' />
    </b>
  </a>
</root>`
    );
  });

  it('two explicit namespaces at root with inline attributes and mixed content', () => {
    const w = new XNamespace('urn:w');
    const x = new XNamespace('urn:x');
    const root = new XElement(w + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
      new XAttribute('id', 'main'),
      new XElement(w + 'header', new XAttribute(x + 'type', 'primary'), 'Header text'),
      new XElement(w + 'body', new XAttribute('class', 'main'),
        new XElement(x + 'item', new XAttribute(w + 'ref', '1'), 'content')
      )
    );
    expect(root.toStringWithIndentation()).toBe(
`<w:root xmlns:w='urn:w' xmlns:x='urn:x' id='main'>
  <w:header x:type='primary'>Header text</w:header>
  <w:body class='main'>
    <x:item w:ref='1'>content</x:item>
  </w:body>
</w:root>`
    );
  });

  it('XDocument with two namespaces, deep nesting, and mixed content', () => {
    const doc_ns = new XNamespace('urn:doc');
    const m_ns = new XNamespace('urn:meta');
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', 'yes'),
      new XElement(doc_ns + 'document',
        new XAttribute(XNamespace.xmlns + 'doc', 'urn:doc'),
        new XAttribute(XNamespace.xmlns + 'm', 'urn:meta'),
        new XElement(m_ns + 'metadata',
          new XElement(m_ns + 'title', 'Test Doc')
        ),
        new XElement(doc_ns + 'body',
          new XElement(doc_ns + 'section', new XAttribute('id', '1'),
            new XElement(doc_ns + 'para',
              new XText('Hello '),
              new XElement(doc_ns + 'em', 'world')
            )
          )
        )
      )
    );
    expect(doc.toStringWithIndentation()).toBe(
`<?xml version='1.0' encoding='utf-8' standalone='yes'?>
<doc:document xmlns:doc='urn:doc' xmlns:m='urn:meta'>
  <m:metadata>
    <m:title>Test Doc</m:title>
  </m:metadata>
  <doc:body>
    <doc:section id='1'>
      <doc:para>Hello <doc:em>world</doc:em></doc:para>
    </doc:section>
  </doc:body>
</doc:document>`
    );
  });
});

describe('toString compact output', () => {
  it('nested element tree', () => {
    const root = new XElement('root',
      new XElement('child', 'hello')
    );
    expect(root.toString()).toBe(`<root><child>hello</child></root>`);
  });

  it('self-closing child element', () => {
    const root = new XElement('root',
      new XElement('empty')
    );
    expect(root.toString()).toBe(`<root><empty /></root>`);
  });

  it('XDocument with declaration', () => {
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', ''),
      new XElement('root', new XElement('child'))
    );
    expect(doc.toString()).toBe(`<?xml version='1.0' encoding='utf-8'?><root><child /></root>`);
  });

  it('comment node', () => {
    const root = new XElement('root',
      new XComment('hello')
    );
    expect(root.toString()).toBe(`<root><!--hello--></root>`);
  });

  it('processing instruction', () => {
    const root = new XElement('root',
      new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
    );
    expect(root.toString()).toBe(`<root><?xml-stylesheet type="text/css"?></root>`);
  });

  it('calling toString() twice produces the same result', () => {
    const root = new XElement('root', new XElement('child'));
    expect(root.toString()).toBe(root.toString());
  });

  it('text-only siblings', () => {
    const root = new XElement('root',
      new XElement('a', 'first'),
      new XElement('b', 'second')
    );
    expect(root.toString()).toBe(`<root><a>first</a><b>second</b></root>`);
  });

  it('mixed-content element', () => {
    const root = new XElement('root',
      new XElement('p',
        new XText('Hello '),
        new XElement('b', 'world')
      )
    );
    expect(root.toString()).toBe(`<root><p>Hello <b>world</b></p></root>`);
  });

  it('deeply nested text-only elements', () => {
    const root = new XElement('root',
      new XElement('section',
        new XElement('para', 'text')
      )
    );
    expect(root.toString()).toBe(`<root><section><para>text</para></section></root>`);
  });

  it('mixed-content subtree with text on both sides', () => {
    const root = new XElement('root',
      new XElement('outer',
        new XText('before'),
        new XElement('inner', 'inside'),
        new XText('after')
      )
    );
    expect(root.toString()).toBe(`<root><outer>before<inner>inside</inner>after</outer></root>`);
  });

  it('attributes on elements at every nesting level', () => {
    const root = new XElement('root', new XAttribute('lang', 'en'),
      new XElement('section', new XAttribute('id', '1'),
        new XElement('para', new XAttribute('class', 'intro'), 'Hello')
      )
    );
    expect(root.toString()).toBe(
      `<root lang='en'><section id='1'><para class='intro'>Hello</para></section></root>`
    );
  });

  it('attributes on deep element with self-closing leaf', () => {
    const root = new XElement('root', new XAttribute('id', '1'),
      new XElement('item', new XAttribute('type', 'widget'), new XAttribute('active', 'true'),
        new XElement('name', 'foo')
      )
    );
    expect(root.toString()).toBe(
      `<root id='1'><item type='widget' active='true'><name>foo</name></item></root>`
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
    expect(root.toString()).toBe(`<a><b><c><d /></c></b></a>`);
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
    expect(root.toString()).toBe(`<l1><l2><l3><l4><l5 x='y' /></l4></l3></l2></l1>`);
  });

  it('comments at root level and nested level', () => {
    const root = new XElement('root',
      new XComment('top level comment'),
      new XElement('child',
        new XComment('nested comment'),
        new XElement('leaf')
      )
    );
    expect(root.toString()).toBe(
      `<root><!--top level comment--><child><!--nested comment--><leaf /></child></root>`
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
    expect(root.toString()).toBe(
      `<root><?app init?><child><?nested value?><leaf>content</leaf></child></root>`
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
    expect(root.toString()).toBe(
      `<article><p>Text with <em>emphasis</em> inline</p><aside><note>side note</note></aside></article>`
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
    expect(root.toString()).toBe(
      `<root><outer><inner>text with <b>bold</b></inner></outer></root>`
    );
  });

  it('namespace-prefixed elements at multiple nesting levels', () => {
    const w = new XNamespace('urn:test');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:test'),
      new XElement(w + 'child',
        new XElement(w + 'leaf')
      )
    );
    expect(root.toString()).toBe(
      `<w:root xmlns:w='urn:test'><w:child><w:leaf /></w:child></w:root>`
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
    expect(root.toString()).toBe(
      `<root><header>Title</header><body><section><p>Paragraph one</p><p>Paragraph two</p></section></body><footer>End</footer></root>`
    );
  });

  it('two explicit namespaces nested two levels', () => {
    const w = new XNamespace('urn:w');
    const x = new XNamespace('urn:x');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(x + 'child', new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
        new XElement(w + 'leaf')
      )
    );
    expect(root.toString()).toBe(
      `<w:root xmlns:w='urn:w'><x:child xmlns:x='urn:x'><w:leaf /></x:child></w:root>`
    );
  });

  it('explicit namespace declared at root used in no-namespace grandchild sibling', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement('plain',
        new XElement(ns + 'inner')
      )
    );
    expect(root.toString()).toBe(
      `<ns:root xmlns:ns='urn:ns'><plain><ns:inner /></plain></ns:root>`
    );
  });

  it('namespace used in both element name and attribute', () => {
    const w = new XNamespace('urn:w');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(w + 'item', new XAttribute(w + 'id', '1'), new XAttribute('name', 'foo'))
    );
    expect(root.toString()).toBe(
      `<w:root xmlns:w='urn:w'><w:item w:id='1' name='foo' /></w:root>`
    );
  });

  it('two namespaces declared at root used at different depths', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'root',
      new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
      new XElement(a + 'section',
        new XElement(b + 'item', 'value')
      )
    );
    expect(root.toString()).toBe(
      `<a:root xmlns:a='urn:a' xmlns:b='urn:b'><a:section><b:item>value</b:item></a:section></a:root>`
    );
  });

  it('three levels each with a different explicit prefix', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const c = new XNamespace('urn:c');
    const root = new XElement(a + 'root', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(b + 'section', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(c + 'item', new XAttribute(XNamespace.xmlns + 'c', 'urn:c'), 'text')
      )
    );
    expect(root.toString()).toBe(
      `<a:root xmlns:a='urn:a'><b:section xmlns:b='urn:b'><c:item xmlns:c='urn:c'>text</c:item></b:section></a:root>`
    );
  });

  it('single explicit namespace used four levels deep', () => {
    const w = new XNamespace('urn:w');
    const root = new XElement(w + 'root', new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XElement(w + 'body',
        new XElement(w + 'section', new XAttribute('id', '1'),
          new XElement(w + 'para', 'text')
        )
      )
    );
    expect(root.toString()).toBe(
      `<w:root xmlns:w='urn:w'><w:body><w:section id='1'><w:para>text</w:para></w:section></w:body></w:root>`
    );
  });

  it('no-namespace root with children each in their own explicitly declared namespace', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement('root',
      new XElement(a + 'header', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'), 'Title'),
      new XElement(b + 'body', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(a + 'para', 'content')
      )
    );
    expect(root.toString()).toBe(
      `<root><a:header xmlns:a='urn:a'>Title</a:header><b:body xmlns:b='urn:b'><p0:para xmlns:p0='urn:a'>content</p0:para></b:body></root>`
    );
  });

  it('five levels alternating between two explicit namespaces', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'l1', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(b + 'l2', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
        new XElement(a + 'l3',
          new XElement(b + 'l4',
            new XElement(a + 'l5')
          )
        )
      )
    );
    expect(root.toString()).toBe(
      `<a:l1 xmlns:a='urn:a'><b:l2 xmlns:b='urn:b'><a:l3><b:l4><a:l5 /></b:l4></a:l3></b:l2></a:l1>`
    );
  });

  it('root declares two namespaces, deep descendant uses both in one element', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement('root',
      new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
      new XElement('section',
        new XElement('row',
          new XElement(a + 'cell', new XAttribute(b + 'type', 'header'), 'text')
        )
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns:a='urn:a' xmlns:b='urn:b'><section><row><a:cell b:type='header'>text</a:cell></row></section></root>`
    );
  });

  it('explicit namespace with attributes in both namespace and no-namespace at multiple levels', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'item',
        new XAttribute('class', 'primary'),
        new XAttribute(ns + 'id', '1'),
        new XElement(ns + 'name', new XAttribute('lang', 'en'), 'World')
      )
    );
    expect(root.toString()).toBe(
      `<ns:root xmlns:ns='urn:ns'><ns:item class='primary' ns:id='1'><ns:name lang='en'>World</ns:name></ns:item></ns:root>`
    );
  });

  it('all elements share one undeclared namespace — single p0 throughout', () => {
    const ns = new XNamespace('urn:ex');
    const root = new XElement(ns + 'root',
      new XElement(ns + 'child',
        new XElement(ns + 'leaf')
      )
    );
    expect(root.toString()).toBe(
      `<p0:root xmlns:p0='urn:ex'><p0:child><p0:leaf /></p0:child></p0:root>`
    );
  });

  it('undeclared namespace on attribute only — p0 on attribute, element has no prefix', () => {
    const attr_ns = new XNamespace('urn:attr');
    const root = new XElement('root',
      new XElement('item',
        new XAttribute(attr_ns + 'type', 'primary')
      )
    );
    expect(root.toString()).toBe(
      `<root><item p0:type='primary' xmlns:p0='urn:attr' /></root>`
    );
  });

  it('element and attribute in different undeclared namespaces — attr gets p0, element gets p1', () => {
    const el_ns = new XNamespace('urn:el');
    const at_ns = new XNamespace('urn:at');
    const root = new XElement('root',
      new XElement(el_ns + 'item',
        new XAttribute(at_ns + 'id', '1')
      )
    );
    expect(root.toString()).toBe(
      `<root><p1:item p0:id='1' xmlns:p0='urn:at' xmlns:p1='urn:el' /></root>`
    );
  });

  it('element and attribute share the same undeclared namespace — single p0', () => {
    const ns = new XNamespace('urn:shared');
    const root = new XElement('root',
      new XElement(ns + 'item',
        new XAttribute(ns + 'id', '42')
      )
    );
    expect(root.toString()).toBe(
      `<root><p0:item p0:id='42' xmlns:p0='urn:shared' /></root>`
    );
  });

  it('explicit-prefix parent, undeclared-namespace child gets p0', () => {
    const outer = new XNamespace('urn:outer');
    const inner = new XNamespace('urn:inner');
    const root = new XElement(outer + 'root', new XAttribute(XNamespace.xmlns + 'outer', 'urn:outer'),
      new XElement(inner + 'child')
    );
    expect(root.toString()).toBe(
      `<outer:root xmlns:outer='urn:outer'><p0:child xmlns:p0='urn:inner' /></outer:root>`
    );
  });

  it('undeclared namespace at depth 3 with no-namespace ancestors', () => {
    const ns = new XNamespace('urn:deep');
    const root = new XElement('root',
      new XElement('level1',
        new XElement('level2',
          new XElement(ns + 'leaf', new XAttribute('x', 'y'))
        )
      )
    );
    expect(root.toString()).toBe(
      `<root><level1><level2><p0:leaf x='y' xmlns:p0='urn:deep' /></level2></level1></root>`
    );
  });

  it('two undeclared attribute namespaces and one undeclared element namespace — p0 p1 p2', () => {
    const ns1 = new XNamespace('urn:ns1');
    const ns2 = new XNamespace('urn:ns2');
    const ns3 = new XNamespace('urn:ns3');
    const root = new XElement('root',
      new XElement('section',
        new XElement(ns1 + 'item',
          new XAttribute(ns2 + 'type', 'a'),
          new XAttribute(ns3 + 'lang', 'en')
        )
      )
    );
    expect(root.toString()).toBe(
      `<root><section><p2:item p0:type='a' p1:lang='en' xmlns:p0='urn:ns2' xmlns:p1='urn:ns3' xmlns:p2='urn:ns1' /></section></root>`
    );
  });

  it('auto-generated p# prefix inside a mixed-content subtree', () => {
    const ns = new XNamespace('urn:em');
    const root = new XElement('root',
      new XElement('para',
        new XText('See '),
        new XElement(ns + 'em', 'note'),
        new XText(' below')
      )
    );
    expect(root.toString()).toBe(
      `<root><para>See <p0:em xmlns:p0='urn:em'>note</p0:em> below</para></root>`
    );
  });

  it('default namespace declared at root, children inherit it', () => {
    const ns = new XNamespace('urn:def');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(ns + 'child', new XAttribute('id', '1'),
        new XElement(ns + 'leaf')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:def'><child id='1'><leaf /></child></root>`
    );
  });

  it('default namespace with text-only leaves at depth 3', () => {
    const ns = new XNamespace('urn:html');
    const root = new XElement(ns + 'html', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:html'),
      new XElement(ns + 'body',
        new XElement(ns + 'p', 'Hello world')
      )
    );
    expect(root.toString()).toBe(
      `<html xmlns='urn:html'><body><p>Hello world</p></body></html>`
    );
  });

  it('default namespace at root, child in explicit-prefix namespace, grandchild back in default', () => {
    const defNs = new XNamespace('urn:def');
    const xNs = new XNamespace('urn:x');
    const root = new XElement(defNs + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(xNs + 'special', new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
        new XElement(defNs + 'normal', 'content')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:def'><x:special xmlns:x='urn:x'><normal>content</normal></x:special></root>`
    );
  });

  it('default namespace at root, deeply nested no-namespace element', () => {
    const ns = new XNamespace('urn:doc');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:doc'),
      new XElement(ns + 'body',
        new XElement(ns + 'section',
          new XElement('raw')
        )
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:doc'><body><section><raw /></section></body></root>`
    );
  });

  it('child redeclares default namespace to a different URI', () => {
    const ns1 = new XNamespace('urn:ns1');
    const ns2 = new XNamespace('urn:ns2');
    const root = new XElement(ns1 + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns1'),
      new XElement(ns2 + 'sub', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns2'),
        new XElement(ns2 + 'item', 'text')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:ns1'><sub xmlns='urn:ns2'><item>text</item></sub></root>`
    );
  });

  it('default namespace declared at a nested level, parent element is in no namespace', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement('root', new XAttribute('version', '1.0'),
      new XElement(ns + 'data', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:ns'),
        new XElement(ns + 'record', new XAttribute('id', '1'), 'value')
      )
    );
    expect(root.toString()).toBe(
      `<root version='1.0'><data xmlns='urn:ns'><record id='1'>value</record></data></root>`
    );
  });

  it('default namespace with attributes only in no-namespace', () => {
    const ns = new XNamespace('urn:form');
    const root = new XElement(ns + 'form', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:form'),
      new XElement(ns + 'field',
        new XAttribute('name', 'email'),
        new XAttribute('required', 'true'),
        new XElement(ns + 'label', 'Email address')
      )
    );
    expect(root.toString()).toBe(
      `<form xmlns='urn:form'><field name='email' required='true'><label>Email address</label></field></form>`
    );
  });

  it('default namespace with mixed content', () => {
    const ns = new XNamespace('urn:doc');
    const root = new XElement(ns + 'doc', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:doc'),
      new XElement(ns + 'p',
        new XText('Hello '),
        new XElement(ns + 'em', 'world')
      )
    );
    expect(root.toString()).toBe(
      `<doc xmlns='urn:doc'><p>Hello <em>world</em></p></doc>`
    );
  });

  it('foreign element in default-namespace tree gets auto p# prefix', () => {
    const defNs = new XNamespace('urn:def');
    const extNs = new XNamespace('urn:ext');
    const root = new XElement(defNs + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(defNs + 'section',
        new XElement(extNs + 'foreign')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:def'><section><p0:foreign xmlns:p0='urn:ext' /></section></root>`
    );
  });

  it('mixed content with explicit-prefix inline element', () => {
    const doc = new XNamespace('urn:doc');
    const hl = new XNamespace('urn:hl');
    const root = new XElement(doc + 'root', new XAttribute(XNamespace.xmlns + 'doc', 'urn:doc'),
      new XElement(doc + 'para',
        new XText('Click '),
        new XElement(hl + 'link', new XAttribute(XNamespace.xmlns + 'hl', 'urn:hl'), 'here'),
        new XText(' to continue')
      )
    );
    expect(root.toString()).toBe(
      `<doc:root xmlns:doc='urn:doc'><doc:para>Click <hl:link xmlns:hl='urn:hl'>here</hl:link> to continue</doc:para></doc:root>`
    );
  });

  it('default-namespace tree with mixed content containing auto-p# foreign inline element', () => {
    const def = new XNamespace('urn:def');
    const ext = new XNamespace('urn:ext');
    const root = new XElement(def + 'root', new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XElement(def + 'para',
        new XText('See '),
        new XElement(ext + 'ref', 'item'),
        new XText(' below')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:def'><para>See <p0:ref xmlns:p0='urn:ext'>item</p0:ref> below</para></root>`
    );
  });

  it('mixed content at depth 3 inside namespace tree from parent scope', () => {
    const a = new XNamespace('urn:a');
    const b = new XNamespace('urn:b');
    const root = new XElement(a + 'root', new XAttribute(XNamespace.xmlns + 'a', 'urn:a'),
      new XElement(a + 'section',
        new XElement(b + 'para', new XAttribute(XNamespace.xmlns + 'b', 'urn:b'),
          new XText('Start '),
          new XElement(a + 'em', 'text'),
          new XText(' end')
        )
      )
    );
    expect(root.toString()).toBe(
      `<a:root xmlns:a='urn:a'><a:section><b:para xmlns:b='urn:b'>Start <a:em>text</a:em> end</b:para></a:section></a:root>`
    );
  });

  it('comment at depth 4 inside a namespaced element tree', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'a',
        new XElement(ns + 'b',
          new XComment('deep comment'),
          new XElement(ns + 'c')
        )
      )
    );
    expect(root.toString()).toBe(
      `<ns:root xmlns:ns='urn:ns'><ns:a><ns:b><!--deep comment--><ns:c /></ns:b></ns:a></ns:root>`
    );
  });

  it('processing instruction at depth 3 inside a namespaced element tree', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement(ns + 'body',
        new XProcessingInstruction('app', 'mode=edit'),
        new XElement(ns + 'content', 'data')
      )
    );
    expect(root.toString()).toBe(
      `<ns:root xmlns:ns='urn:ns'><ns:body><?app mode=edit?><ns:content>data</ns:content></ns:body></ns:root>`
    );
  });

  it('XDocument with declaration and namespaced root element', () => {
    const ns = new XNamespace('urn:app');
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', ''),
      new XElement(ns + 'app', new XAttribute(XNamespace.xmlns + 'ns', 'urn:app'),
        new XElement(ns + 'config',
          new XElement(ns + 'setting', new XAttribute('key', 'debug'), 'true')
        )
      )
    );
    expect(doc.toString()).toBe(
      `<?xml version='1.0' encoding='utf-8'?><ns:app xmlns:ns='urn:app'><ns:config><ns:setting key='debug'>true</ns:setting></ns:config></ns:app>`
    );
  });

  it('multiple namespace declarations at root, attributes use both at nested level', () => {
    const w = new XNamespace('urn:w');
    const m = new XNamespace('urn:m');
    const root = new XElement('root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XAttribute(XNamespace.xmlns + 'm', 'urn:m'),
      new XElement('row',
        new XAttribute(w + 'align', 'left'),
        new XAttribute(m + 'color', 'red'),
        new XElement('cell', new XAttribute('span', '2'), 'data')
      )
    );
    expect(root.toString()).toBe(
      `<root xmlns:w='urn:w' xmlns:m='urn:m'><row w:align='left' m:color='red'><cell span='2'>data</cell></row></root>`
    );
  });

  it('default namespace and explicit prefix declared at root, siblings use each', () => {
    const def = new XNamespace('urn:def');
    const x = new XNamespace('urn:x');
    const root = new XElement(def + 'root',
      new XAttribute(XNamespace.xmlns + 'xmlns', 'urn:def'),
      new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
      new XElement(def + 'a', 'first'),
      new XElement(x + 'b', 'second'),
      new XElement(def + 'c', 'third')
    );
    expect(root.toString()).toBe(
      `<root xmlns='urn:def' xmlns:x='urn:x'><a>first</a><x:b>second</x:b><c>third</c></root>`
    );
  });

  it('namespace prefix declared at a middle level, used in descendants', () => {
    const ns = new XNamespace('urn:mid');
    const root = new XElement('root',
      new XElement('outer',
        new XElement(ns + 'middle', new XAttribute(XNamespace.xmlns + 'mid', 'urn:mid'),
          new XElement(ns + 'inner',
            new XElement(ns + 'leaf', 'text')
          )
        )
      )
    );
    expect(root.toString()).toBe(
      `<root><outer><mid:middle xmlns:mid='urn:mid'><mid:inner><mid:leaf>text</mid:leaf></mid:inner></mid:middle></outer></root>`
    );
  });

  it('no-namespace elements alternate with namespaced elements at multiple depths', () => {
    const ns = new XNamespace('urn:ns');
    const root = new XElement(ns + 'root', new XAttribute(XNamespace.xmlns + 'ns', 'urn:ns'),
      new XElement('plain1',
        new XElement(ns + 'ns-child',
          new XElement('plain2',
            new XElement(ns + 'leaf')
          )
        )
      )
    );
    expect(root.toString()).toBe(
      `<ns:root xmlns:ns='urn:ns'><plain1><ns:ns-child><plain2><ns:leaf /></plain2></ns:ns-child></plain1></ns:root>`
    );
  });

  it('auto-p# attribute namespace and auto-p# element namespace at depth 3', () => {
    const ns1 = new XNamespace('urn:attr1');
    const ns2 = new XNamespace('urn:elem1');
    const root = new XElement('root',
      new XElement('a',
        new XElement('b',
          new XElement(ns2 + 'leaf',
            new XAttribute(ns1 + 'id', 'x')
          )
        )
      )
    );
    expect(root.toString()).toBe(
      `<root><a><b><p1:leaf p0:id='x' xmlns:p0='urn:attr1' xmlns:p1='urn:elem1' /></b></a></root>`
    );
  });

  it('two explicit namespaces at root with inline attributes and mixed content', () => {
    const w = new XNamespace('urn:w');
    const x = new XNamespace('urn:x');
    const root = new XElement(w + 'root',
      new XAttribute(XNamespace.xmlns + 'w', 'urn:w'),
      new XAttribute(XNamespace.xmlns + 'x', 'urn:x'),
      new XAttribute('id', 'main'),
      new XElement(w + 'header', new XAttribute(x + 'type', 'primary'), 'Header text'),
      new XElement(w + 'body', new XAttribute('class', 'main'),
        new XElement(x + 'item', new XAttribute(w + 'ref', '1'), 'content')
      )
    );
    expect(root.toString()).toBe(
      `<w:root xmlns:w='urn:w' xmlns:x='urn:x' id='main'><w:header x:type='primary'>Header text</w:header><w:body class='main'><x:item w:ref='1'>content</x:item></w:body></w:root>`
    );
  });

  it('XDocument with two namespaces, deep nesting, and mixed content', () => {
    const doc_ns = new XNamespace('urn:doc');
    const m_ns = new XNamespace('urn:meta');
    const doc = new XDocument(
      new XDeclaration('1.0', 'utf-8', 'yes'),
      new XElement(doc_ns + 'document',
        new XAttribute(XNamespace.xmlns + 'doc', 'urn:doc'),
        new XAttribute(XNamespace.xmlns + 'm', 'urn:meta'),
        new XElement(m_ns + 'metadata',
          new XElement(m_ns + 'title', 'Test Doc')
        ),
        new XElement(doc_ns + 'body',
          new XElement(doc_ns + 'section', new XAttribute('id', '1'),
            new XElement(doc_ns + 'para',
              new XText('Hello '),
              new XElement(doc_ns + 'em', 'world')
            )
          )
        )
      )
    );
    expect(doc.toString()).toBe(
      `<?xml version='1.0' encoding='utf-8' standalone='yes'?><doc:document xmlns:doc='urn:doc' xmlns:m='urn:meta'><m:metadata><m:title>Test Doc</m:title></m:metadata><doc:body><doc:section id='1'><doc:para>Hello <doc:em>world</doc:em></doc:para></doc:section></doc:body></doc:document>`
    );
  });
});
