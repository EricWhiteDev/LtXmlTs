/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XElement, XDocument } from 'ltxmlts';

describe('Round-trip — Serialization', () => {
  it('Basic serialization', () => {
    const originalXml = `<root><child>hello</child></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('Serialization with namespace and prefix', () => {
    const originalXml = `<w:root xmlns:w='urn:www' foo='bar'><w:child>hello</w:child></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-generates a p# prefix for an element in an undeclared namespace', () => {
    const originalXml = `<p0:root xmlns:p0='urn:test:autogen:element' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-generates a p# prefix for an attribute in an undeclared namespace', () => {
    const originalXml = `<root p0:lang='en' xmlns:p0='urn:test:autogen:attr' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-generates distinct p# prefixes for element and attribute in different undeclared namespaces', () => {
    const originalXml = `<p1:root p0:attr='val' xmlns:p0='urn:test:autogen:multi2' xmlns:p1='urn:test:autogen:multi1' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('generates only one p# declaration when element and attribute share the same undeclared namespace', () => {
    const originalXml = `<p0:root p0:attr='val' xmlns:p0='urn:test:autogen:shared' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('pHashCount is reset even when toStringInternal throws', () => {
    const originalXml = `<p0:good xmlns:p0='urn:test:phash-exception' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('prefix collision in child does not corrupt parent element prefix', () => {
    const originalXml = `<w:root xmlns:w='urn:collision-test:parent'><child xmlns:w='urn:collision-test:child' /></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });
});

describe('Round-trip — Default namespace serialization', () => {
  it('element in its own declared default namespace renders without prefix', () => {
    const originalXml = `<root xmlns='urn:default:self' />`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('child element in inherited default namespace renders without prefix', () => {
    const originalXml = `<root xmlns='urn:default:child'><child /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('element not in default namespace still gets a p# prefix', () => {
    const originalXml = `<root xmlns='urn:default:mixed-def'><p0:child xmlns:p0='urn:default:mixed-other' /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });
});

describe('Round-trip — toStringWithIndentation', () => {
  it('formats a nested element tree with 2-space indentation', () => {
    const originalXml = `<root>
  <child>hello</child>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('formats a self-closing element on one line', () => {
    const originalXml = `<root>
  <empty />
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('formats XDocument with declaration', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8'?>
<root>
  <child />
</root>`;
    const roundTrippedXml = XDocument.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('formats a comment node', () => {
    const originalXml = `<root>
  <!--hello-->
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('formats a processing instruction', () => {
    const originalXml = `<root>
  <?xml-stylesheet type="text/css"?>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('text-only element is not split across lines', () => {
    const originalXml = `<root>
  <a>first</a>
  <b>second</b>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed-content element is kept compact', () => {
    const originalXml = `<root>
  <p>Hello <b>world</b></p>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('deeply nested text-only elements are each on one line', () => {
    const originalXml = `<root>
  <section>
    <para>text</para>
  </section>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed-content subtree is emitted fully compact', () => {
    const originalXml = `<root>
  <outer>before<inner>inside</inner>after</outer>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('attributes on elements at every nesting level', () => {
    const originalXml = `<root lang='en'>
  <section id='1'>
    <para class='intro'>Hello</para>
  </section>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('attributes on deep element with self-closing leaf', () => {
    const originalXml = `<root id='1'>
  <item type='widget' active='true'>
    <name>foo</name>
  </item>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('four levels of element-only nesting', () => {
    const originalXml = `<a>
  <b>
    <c>
      <d />
    </c>
  </b>
</a>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('five levels deep with attribute on innermost element', () => {
    const originalXml = `<l1>
  <l2>
    <l3>
      <l4>
        <l5 x='y' />
      </l4>
    </l3>
  </l2>
</l1>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('comments at root level and nested level', () => {
    const originalXml = `<root>
  <!--top level comment-->
  <child>
    <!--nested comment-->
    <leaf />
  </child>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('processing instructions at root level and nested level', () => {
    const originalXml = `<root>
  <?app init?>
  <child>
    <?nested value?>
    <leaf>content</leaf>
  </child>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content at child level alongside element-only siblings', () => {
    const originalXml = `<article>
  <p>Text with <em>emphasis</em> inline</p>
  <aside>
    <note>side note</note>
  </aside>
</article>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content deeply nested inside element-only ancestors', () => {
    const originalXml = `<root>
  <outer>
    <inner>text with <b>bold</b></inner>
  </outer>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace-prefixed elements at multiple nesting levels', () => {
    const originalXml = `<w:root xmlns:w='urn:test'>
  <w:child>
    <w:leaf />
  </w:child>
</w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed text-only and element-only siblings at multiple depths', () => {
    const originalXml = `<root>
  <header>Title</header>
  <body>
    <section>
      <p>Paragraph one</p>
      <p>Paragraph two</p>
    </section>
  </body>
  <footer>End</footer>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two explicit namespaces nested two levels', () => {
    const originalXml = `<w:root xmlns:w='urn:w'>
  <x:child xmlns:x='urn:x'>
    <w:leaf />
  </x:child>
</w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit namespace declared at root used in no-namespace grandchild sibling', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'>
  <plain>
    <ns:inner />
  </plain>
</ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace used in both element name and attribute', () => {
    const originalXml = `<w:root xmlns:w='urn:w'>
  <w:item w:id='1' name='foo' />
</w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two namespaces declared at root used at different depths', () => {
    const originalXml = `<a:root xmlns:a='urn:a' xmlns:b='urn:b'>
  <a:section>
    <b:item>value</b:item>
  </a:section>
</a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('three levels each with a different explicit prefix', () => {
    const originalXml = `<a:root xmlns:a='urn:a'>
  <b:section xmlns:b='urn:b'>
    <c:item xmlns:c='urn:c'>text</c:item>
  </b:section>
</a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('single explicit namespace used four levels deep', () => {
    const originalXml = `<w:root xmlns:w='urn:w'>
  <w:body>
    <w:section id='1'>
      <w:para>text</w:para>
    </w:section>
  </w:body>
</w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('no-namespace root with children each in their own explicitly declared namespace', () => {
    const originalXml = `<root>
  <a:header xmlns:a='urn:a'>Title</a:header>
  <b:body xmlns:b='urn:b'>
    <p0:para xmlns:p0='urn:a'>content</p0:para>
  </b:body>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('five levels alternating between two explicit namespaces', () => {
    const originalXml = `<a:l1 xmlns:a='urn:a'>
  <b:l2 xmlns:b='urn:b'>
    <a:l3>
      <b:l4>
        <a:l5 />
      </b:l4>
    </a:l3>
  </b:l2>
</a:l1>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('root declares two namespaces, deep descendant uses both in one element', () => {
    const originalXml = `<root xmlns:a='urn:a' xmlns:b='urn:b'>
  <section>
    <row>
      <a:cell b:type='header'>text</a:cell>
    </row>
  </section>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit namespace with attributes in both namespace and no-namespace at multiple levels', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'>
  <ns:item class='primary' ns:id='1'>
    <ns:name lang='en'>World</ns:name>
  </ns:item>
</ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('all elements share one undeclared namespace — single p0 throughout', () => {
    const originalXml = `<p0:root xmlns:p0='urn:ex'>
  <p0:child>
    <p0:leaf />
  </p0:child>
</p0:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('undeclared namespace on attribute only — p0 on attribute, element has no prefix', () => {
    const originalXml = `<root>
  <item p0:type='primary' xmlns:p0='urn:attr' />
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('element and attribute in different undeclared namespaces — attr gets p0, element gets p1', () => {
    const originalXml = `<root>
  <p1:item p0:id='1' xmlns:p0='urn:at' xmlns:p1='urn:el' />
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('element and attribute share the same undeclared namespace — single p0', () => {
    const originalXml = `<root>
  <p0:item p0:id='42' xmlns:p0='urn:shared' />
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit-prefix parent, undeclared-namespace child gets p0', () => {
    const originalXml = `<outer:root xmlns:outer='urn:outer'>
  <p0:child xmlns:p0='urn:inner' />
</outer:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('undeclared namespace at depth 3 with no-namespace ancestors', () => {
    const originalXml = `<root>
  <level1>
    <level2>
      <p0:leaf x='y' xmlns:p0='urn:deep' />
    </level2>
  </level1>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two undeclared attribute namespaces and one undeclared element namespace — p0 p1 p2', () => {
    const originalXml = `<root>
  <section>
    <p2:item p0:type='a' p1:lang='en' xmlns:p0='urn:ns2' xmlns:p1='urn:ns3' xmlns:p2='urn:ns1' />
  </section>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-generated p# prefix inside a compact mixed-content subtree', () => {
    const originalXml = `<root>
  <para>See <p0:em xmlns:p0='urn:em'>note</p0:em> below</para>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace declared at root, children inherit it', () => {
    const originalXml = `<root xmlns='urn:def'>
  <child id='1'>
    <leaf />
  </child>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with text-only leaves at depth 3', () => {
    const originalXml = `<html xmlns='urn:html'>
  <body>
    <p>Hello world</p>
  </body>
</html>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace at root, child in explicit-prefix namespace, grandchild back in default', () => {
    const originalXml = `<root xmlns='urn:def'>
  <x:special xmlns:x='urn:x'>
    <normal>content</normal>
  </x:special>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace at root, deeply nested no-namespace element', () => {
    const originalXml = `<root xmlns='urn:doc'>
  <body>
    <section>
      <raw />
    </section>
  </body>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('child redeclares default namespace to a different URI', () => {
    const originalXml = `<root xmlns='urn:ns1'>
  <sub xmlns='urn:ns2'>
    <item>text</item>
  </sub>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace declared at a nested level, parent element is in no namespace', () => {
    const originalXml = `<root version='1.0'>
  <data xmlns='urn:ns'>
    <record id='1'>value</record>
  </data>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with attributes only in no-namespace', () => {
    const originalXml = `<form xmlns='urn:form'>
  <field name='email' required='true'>
    <label>Email address</label>
  </field>
</form>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with mixed content', () => {
    const originalXml = `<doc xmlns='urn:doc'>
  <p>Hello <em>world</em></p>
</doc>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('foreign element in default-namespace tree gets auto p# prefix', () => {
    const originalXml = `<root xmlns='urn:def'>
  <section>
    <p0:foreign xmlns:p0='urn:ext' />
  </section>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content with explicit-prefix inline element', () => {
    const originalXml = `<doc:root xmlns:doc='urn:doc'>
  <doc:para>Click <hl:link xmlns:hl='urn:hl'>here</hl:link> to continue</doc:para>
</doc:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default-namespace tree with mixed content containing auto-p# foreign inline element', () => {
    const originalXml = `<root xmlns='urn:def'>
  <para>See <p0:ref xmlns:p0='urn:ext'>item</p0:ref> below</para>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content at depth 3 inside namespace tree from parent scope', () => {
    const originalXml = `<a:root xmlns:a='urn:a'>
  <a:section>
    <b:para xmlns:b='urn:b'>Start <a:em>text</a:em> end</b:para>
  </a:section>
</a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('comment at depth 4 inside a namespaced element tree', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'>
  <ns:a>
    <ns:b>
      <!--deep comment-->
      <ns:c />
    </ns:b>
  </ns:a>
</ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('processing instruction at depth 3 inside a namespaced element tree', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'>
  <ns:body>
    <?app mode=edit?>
    <ns:content>data</ns:content>
  </ns:body>
</ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('XDocument with declaration and namespaced root element', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8'?>
<ns:app xmlns:ns='urn:app'>
  <ns:config>
    <ns:setting key='debug'>true</ns:setting>
  </ns:config>
</ns:app>`;
    const roundTrippedXml = XDocument.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('multiple namespace declarations at root, attributes use both at nested level', () => {
    const originalXml = `<root xmlns:w='urn:w' xmlns:m='urn:m'>
  <row w:align='left' m:color='red'>
    <cell span='2'>data</cell>
  </row>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace and explicit prefix declared at root, siblings use each', () => {
    const originalXml = `<root xmlns='urn:def' xmlns:x='urn:x'>
  <a>first</a>
  <x:b>second</x:b>
  <c>third</c>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace prefix declared at a middle level, used in descendants', () => {
    const originalXml = `<root>
  <outer>
    <mid:middle xmlns:mid='urn:mid'>
      <mid:inner>
        <mid:leaf>text</mid:leaf>
      </mid:inner>
    </mid:middle>
  </outer>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('no-namespace elements alternate with namespaced elements at multiple depths', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'>
  <plain1>
    <ns:ns-child>
      <plain2>
        <ns:leaf />
      </plain2>
    </ns:ns-child>
  </plain1>
</ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-p# attribute namespace and auto-p# element namespace at depth 3', () => {
    const originalXml = `<root>
  <a>
    <b>
      <p1:leaf p0:id='x' xmlns:p0='urn:attr1' xmlns:p1='urn:elem1' />
    </b>
  </a>
</root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two explicit namespaces at root with inline attributes and mixed content', () => {
    const originalXml = `<w:root xmlns:w='urn:w' xmlns:x='urn:x' id='main'>
  <w:header x:type='primary'>Header text</w:header>
  <w:body class='main'>
    <x:item w:ref='1'>content</x:item>
  </w:body>
</w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('XDocument with two namespaces, deep nesting, and mixed content', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8' standalone='yes'?>
<doc:document xmlns:doc='urn:doc' xmlns:m='urn:meta'>
  <m:metadata>
    <m:title>Test Doc</m:title>
  </m:metadata>
  <doc:body>
    <doc:section id='1'>
      <doc:para>Hello <doc:em>world</doc:em></doc:para>
    </doc:section>
  </doc:body>
</doc:document>`;
    const roundTrippedXml = XDocument.parse(originalXml).toStringWithIndentation();
    expect(roundTrippedXml).toBe(originalXml);
  });
});

describe('Round-trip — toString compact output', () => {
  it('nested element tree', () => {
    const originalXml = `<root><child>hello</child></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('self-closing child element', () => {
    const originalXml = `<root><empty /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('XDocument with declaration', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8'?><root><child /></root>`;
    const roundTrippedXml = XDocument.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('comment node', () => {
    const originalXml = `<root><!--hello--></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('processing instruction', () => {
    const originalXml = `<root><?xml-stylesheet type="text/css"?></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('text-only siblings', () => {
    const originalXml = `<root><a>first</a><b>second</b></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed-content element', () => {
    const originalXml = `<root><p>Hello <b>world</b></p></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('deeply nested text-only elements', () => {
    const originalXml = `<root><section><para>text</para></section></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed-content subtree with text on both sides', () => {
    const originalXml = `<root><outer>before<inner>inside</inner>after</outer></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('attributes on elements at every nesting level', () => {
    const originalXml = `<root lang='en'><section id='1'><para class='intro'>Hello</para></section></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('attributes on deep element with self-closing leaf', () => {
    const originalXml = `<root id='1'><item type='widget' active='true'><name>foo</name></item></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('four levels of element-only nesting', () => {
    const originalXml = `<a><b><c><d /></c></b></a>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('five levels deep with attribute on innermost element', () => {
    const originalXml = `<l1><l2><l3><l4><l5 x='y' /></l4></l3></l2></l1>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('comments at root level and nested level', () => {
    const originalXml = `<root><!--top level comment--><child><!--nested comment--><leaf /></child></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('processing instructions at root level and nested level', () => {
    const originalXml = `<root><?app init?><child><?nested value?><leaf>content</leaf></child></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content at child level alongside element-only siblings', () => {
    const originalXml = `<article><p>Text with <em>emphasis</em> inline</p><aside><note>side note</note></aside></article>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content deeply nested inside element-only ancestors', () => {
    const originalXml = `<root><outer><inner>text with <b>bold</b></inner></outer></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace-prefixed elements at multiple nesting levels', () => {
    const originalXml = `<w:root xmlns:w='urn:test'><w:child><w:leaf /></w:child></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed text-only and element-only siblings at multiple depths', () => {
    const originalXml = `<root><header>Title</header><body><section><p>Paragraph one</p><p>Paragraph two</p></section></body><footer>End</footer></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two explicit namespaces nested two levels', () => {
    const originalXml = `<w:root xmlns:w='urn:w'><x:child xmlns:x='urn:x'><w:leaf /></x:child></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit namespace declared at root used in no-namespace grandchild sibling', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'><plain><ns:inner /></plain></ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace used in both element name and attribute', () => {
    const originalXml = `<w:root xmlns:w='urn:w'><w:item w:id='1' name='foo' /></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two namespaces declared at root used at different depths', () => {
    const originalXml = `<a:root xmlns:a='urn:a' xmlns:b='urn:b'><a:section><b:item>value</b:item></a:section></a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('three levels each with a different explicit prefix', () => {
    const originalXml = `<a:root xmlns:a='urn:a'><b:section xmlns:b='urn:b'><c:item xmlns:c='urn:c'>text</c:item></b:section></a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('single explicit namespace used four levels deep', () => {
    const originalXml = `<w:root xmlns:w='urn:w'><w:body><w:section id='1'><w:para>text</w:para></w:section></w:body></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('no-namespace root with children each in their own explicitly declared namespace', () => {
    const originalXml = `<root><a:header xmlns:a='urn:a'>Title</a:header><b:body xmlns:b='urn:b'><p0:para xmlns:p0='urn:a'>content</p0:para></b:body></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('five levels alternating between two explicit namespaces', () => {
    const originalXml = `<a:l1 xmlns:a='urn:a'><b:l2 xmlns:b='urn:b'><a:l3><b:l4><a:l5 /></b:l4></a:l3></b:l2></a:l1>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('root declares two namespaces, deep descendant uses both in one element', () => {
    const originalXml = `<root xmlns:a='urn:a' xmlns:b='urn:b'><section><row><a:cell b:type='header'>text</a:cell></row></section></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit namespace with attributes in both namespace and no-namespace at multiple levels', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'><ns:item class='primary' ns:id='1'><ns:name lang='en'>World</ns:name></ns:item></ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('all elements share one undeclared namespace — single p0 throughout', () => {
    const originalXml = `<p0:root xmlns:p0='urn:ex'><p0:child><p0:leaf /></p0:child></p0:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('undeclared namespace on attribute only — p0 on attribute, element has no prefix', () => {
    const originalXml = `<root><item p0:type='primary' xmlns:p0='urn:attr' /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('element and attribute in different undeclared namespaces — attr gets p0, element gets p1', () => {
    const originalXml = `<root><p1:item p0:id='1' xmlns:p0='urn:at' xmlns:p1='urn:el' /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('element and attribute share the same undeclared namespace — single p0', () => {
    const originalXml = `<root><p0:item p0:id='42' xmlns:p0='urn:shared' /></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('explicit-prefix parent, undeclared-namespace child gets p0', () => {
    const originalXml = `<outer:root xmlns:outer='urn:outer'><p0:child xmlns:p0='urn:inner' /></outer:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('undeclared namespace at depth 3 with no-namespace ancestors', () => {
    const originalXml = `<root><level1><level2><p0:leaf x='y' xmlns:p0='urn:deep' /></level2></level1></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two undeclared attribute namespaces and one undeclared element namespace — p0 p1 p2', () => {
    const originalXml = `<root><section><p2:item p0:type='a' p1:lang='en' xmlns:p0='urn:ns2' xmlns:p1='urn:ns3' xmlns:p2='urn:ns1' /></section></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-generated p# prefix inside a mixed-content subtree', () => {
    const originalXml = `<root><para>See <p0:em xmlns:p0='urn:em'>note</p0:em> below</para></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace declared at root, children inherit it', () => {
    const originalXml = `<root xmlns='urn:def'><child id='1'><leaf /></child></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with text-only leaves at depth 3', () => {
    const originalXml = `<html xmlns='urn:html'><body><p>Hello world</p></body></html>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace at root, child in explicit-prefix namespace, grandchild back in default', () => {
    const originalXml = `<root xmlns='urn:def'><x:special xmlns:x='urn:x'><normal>content</normal></x:special></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace at root, deeply nested no-namespace element', () => {
    const originalXml = `<root xmlns='urn:doc'><body><section><raw /></section></body></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('child redeclares default namespace to a different URI', () => {
    const originalXml = `<root xmlns='urn:ns1'><sub xmlns='urn:ns2'><item>text</item></sub></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace declared at a nested level, parent element is in no namespace', () => {
    const originalXml = `<root version='1.0'><data xmlns='urn:ns'><record id='1'>value</record></data></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with attributes only in no-namespace', () => {
    const originalXml = `<form xmlns='urn:form'><field name='email' required='true'><label>Email address</label></field></form>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace with mixed content', () => {
    const originalXml = `<doc xmlns='urn:doc'><p>Hello <em>world</em></p></doc>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('foreign element in default-namespace tree gets auto p# prefix', () => {
    const originalXml = `<root xmlns='urn:def'><section><p0:foreign xmlns:p0='urn:ext' /></section></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content with explicit-prefix inline element', () => {
    const originalXml = `<doc:root xmlns:doc='urn:doc'><doc:para>Click <hl:link xmlns:hl='urn:hl'>here</hl:link> to continue</doc:para></doc:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default-namespace tree with mixed content containing auto-p# foreign inline element', () => {
    const originalXml = `<root xmlns='urn:def'><para>See <p0:ref xmlns:p0='urn:ext'>item</p0:ref> below</para></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('mixed content at depth 3 inside namespace tree from parent scope', () => {
    const originalXml = `<a:root xmlns:a='urn:a'><a:section><b:para xmlns:b='urn:b'>Start <a:em>text</a:em> end</b:para></a:section></a:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('comment at depth 4 inside a namespaced element tree', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'><ns:a><ns:b><!--deep comment--><ns:c /></ns:b></ns:a></ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('processing instruction at depth 3 inside a namespaced element tree', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'><ns:body><?app mode=edit?><ns:content>data</ns:content></ns:body></ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('XDocument with declaration and namespaced root element', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8'?><ns:app xmlns:ns='urn:app'><ns:config><ns:setting key='debug'>true</ns:setting></ns:config></ns:app>`;
    const roundTrippedXml = XDocument.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('multiple namespace declarations at root, attributes use both at nested level', () => {
    const originalXml = `<root xmlns:w='urn:w' xmlns:m='urn:m'><row w:align='left' m:color='red'><cell span='2'>data</cell></row></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('default namespace and explicit prefix declared at root, siblings use each', () => {
    const originalXml = `<root xmlns='urn:def' xmlns:x='urn:x'><a>first</a><x:b>second</x:b><c>third</c></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('namespace prefix declared at a middle level, used in descendants', () => {
    const originalXml = `<root><outer><mid:middle xmlns:mid='urn:mid'><mid:inner><mid:leaf>text</mid:leaf></mid:inner></mid:middle></outer></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('no-namespace elements alternate with namespaced elements at multiple depths', () => {
    const originalXml = `<ns:root xmlns:ns='urn:ns'><plain1><ns:ns-child><plain2><ns:leaf /></plain2></ns:ns-child></plain1></ns:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('auto-p# attribute namespace and auto-p# element namespace at depth 3', () => {
    const originalXml = `<root><a><b><p1:leaf p0:id='x' xmlns:p0='urn:attr1' xmlns:p1='urn:elem1' /></b></a></root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('two explicit namespaces at root with inline attributes and mixed content', () => {
    const originalXml = `<w:root xmlns:w='urn:w' xmlns:x='urn:x' id='main'><w:header x:type='primary'>Header text</w:header><w:body class='main'><x:item w:ref='1'>content</x:item></w:body></w:root>`;
    const roundTrippedXml = XElement.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });

  it('XDocument with two namespaces, deep nesting, and mixed content', () => {
    const originalXml = `<?xml version='1.0' encoding='utf-8' standalone='yes'?><doc:document xmlns:doc='urn:doc' xmlns:m='urn:meta'><m:metadata><m:title>Test Doc</m:title></m:metadata><doc:body><doc:section id='1'><doc:para>Hello <doc:em>world</doc:em></doc:para></doc:section></doc:body></doc:document>`;
    const roundTrippedXml = XDocument.parse(originalXml).toString();
    expect(roundTrippedXml).toBe(originalXml);
  });
});
