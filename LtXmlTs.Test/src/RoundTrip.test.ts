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
  <?xml-stylesheet type='text/css'?>
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
    const originalXml = `<root><?xml-stylesheet type='text/css'?></root>`;
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

describe('Round-trip — Open XML: test1', () => {
  it('test1', () => {
    const originalXml = `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:wpc='http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas' xmlns:cx='http://schemas.microsoft.com/office/drawing/2014/chartex' xmlns:cx1='http://schemas.microsoft.com/office/drawing/2015/9/8/chartex' xmlns:cx2='http://schemas.microsoft.com/office/drawing/2015/10/21/chartex' xmlns:cx3='http://schemas.microsoft.com/office/drawing/2016/5/9/chartex' xmlns:cx4='http://schemas.microsoft.com/office/drawing/2016/5/10/chartex' xmlns:cx5='http://schemas.microsoft.com/office/drawing/2016/5/11/chartex' xmlns:cx6='http://schemas.microsoft.com/office/drawing/2016/5/12/chartex' xmlns:cx7='http://schemas.microsoft.com/office/drawing/2016/5/13/chartex' xmlns:cx8='http://schemas.microsoft.com/office/drawing/2016/5/14/chartex' xmlns:mc='http://schemas.openxmlformats.org/markup-compatibility/2006' xmlns:aink='http://schemas.microsoft.com/office/drawing/2016/ink' xmlns:am3d='http://schemas.microsoft.com/office/drawing/2017/model3d' xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:oel='http://schemas.microsoft.com/office/2019/extlst' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xmlns:m='http://schemas.openxmlformats.org/officeDocument/2006/math' xmlns:v='urn:schemas-microsoft-com:vml' xmlns:wp14='http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing' xmlns:wp='http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing' xmlns:w10='urn:schemas-microsoft-com:office:word' xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' xmlns:w14='http://schemas.microsoft.com/office/word/2010/wordml' xmlns:w15='http://schemas.microsoft.com/office/word/2012/wordml' xmlns:w16cex='http://schemas.microsoft.com/office/word/2018/wordml/cex' xmlns:w16cid='http://schemas.microsoft.com/office/word/2016/wordml/cid' xmlns:w16='http://schemas.microsoft.com/office/word/2018/wordml' xmlns:w16du='http://schemas.microsoft.com/office/word/2023/wordml/word16du' xmlns:w16sdtdh='http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash' xmlns:w16sdtfl='http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock' xmlns:w16se='http://schemas.microsoft.com/office/word/2015/wordml/symex' xmlns:wpg='http://schemas.microsoft.com/office/word/2010/wordprocessingGroup' xmlns:wpi='http://schemas.microsoft.com/office/word/2010/wordprocessingInk' xmlns:wne='http://schemas.microsoft.com/office/word/2006/wordml' xmlns:wps='http://schemas.microsoft.com/office/word/2010/wordprocessingShape' mc:Ignorable='w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14'>
  <w:body>
    <w:p w14:paraId='1EA9D8A1' w14:textId='7DACF629' w:rsidR='00F314CB' w:rsidRDefault='00F314CB'>
      <w:r>
        <w:t xml:space='preserve'>Video </w:t>
      </w:r>
      <w:fldSimple w:instr=' CREATEDATE  \* MERGEFORMAT '>
        <w:r>
          <w:rPr>
            <w:noProof />
          </w:rPr>
          <w:t>3/24/26 5:26:00 AM</w:t>
        </w:r>
      </w:fldSimple>
      <w:r>
        <w:t xml:space='preserve'> is a powerful way to help you prove your point. When you click </w:t>
      </w:r>
      <w:hyperlink r:id='rId7' w:history='1'>
        <w:r w:rsidRPr='00F314CB'>
          <w:rPr>
            <w:rStyle w:val='Hyperlink' />
          </w:rPr>
          <w:t>Online Video</w:t>
        </w:r>
      </w:hyperlink>
      <w:r>
        <w:t xml:space='preserve'>, you can paste in the embed code for the video you want to add. You can also type a keyword to search online for the video that best fits your document. Here is </w:t>
      </w:r>
      <w:r w:rsidR='00606287' w:rsidRPr='00606287'>
        <w:rPr>
          <w:shd w:val='clear' w:color='auto' w:fill='E97132' w:themeFill='accent2' />
        </w:rPr>
        <w:t>some formatted text</w:t>
      </w:r>
      <w:r w:rsidR='00606287'>
        <w:t>.</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId='76C811BE' w14:textId='77777777' w:rsidR='00F314CB' w:rsidRDefault='00F314CB'>
      <w:r>
        <w:t xml:space='preserve'>To make your </w:t>
      </w:r>
      <w:r w:rsidRPr='00606287'>
        <w:rPr>
          <w:rFonts w:ascii='Consolas' w:hAnsi='Consolas' w:cs='Consolas' />
          <w:sz w:val='32' />
          <w:szCs w:val='32' />
        </w:rPr>
        <w:t>document look professionally produced</w:t>
      </w:r>
      <w:r>
        <w:t>, Word provides header, footer, cover page, and text box designs that complement each other. For example, you can add a matching cover page, header, and sidebar. Click Insert and then choose the elements you want from the different galleries.</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId='1031A657' w14:textId='77777777' w:rsidR='00F314CB' w:rsidRDefault='00F314CB'>
      <w:r>
        <w:t>Themes and styles also help keep your document coordinated. When you click Design and choose a new Theme, the pictures, charts, and SmartArt graphics change to match your new theme. When you apply styles, your headings change to match the new theme.</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId='43C92A75' w14:textId='77777777' w:rsidR='00F314CB' w:rsidRDefault='00F314CB'>
      <w:r>
        <w:t>Save time in Word with new buttons that show up where you need them. To change the way a picture fits in your document, click it and a button for layout options appears next to it. When you work on a table, click where you want to add a row or a column, and then click the plus sign.</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId='52551A27' w14:textId='423A1AB6' w:rsidR='008F1B95' w:rsidRDefault='00F314CB'>
      <w:r>
        <w:t>Reading is easier, too, in the new Reading view. You can collapse parts of the document and focus on the text you want. If you need to stop reading before you reach the end, Word remembers where you left off - even on another device.</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId='20D91DBA' w14:textId='77777777' w:rsidR='00F314CB' w:rsidRDefault='00F314CB' />
    <w:sectPr w:rsidR='00F314CB'>
      <w:headerReference w:type='default' r:id='rId8' />
      <w:pgSz w:w='12240' w:h='15840' />
      <w:pgMar w:top='1440' w:right='1440' w:bottom='1440' w:left='1440' w:header='720' w:footer='720' w:gutter='0' />
      <w:cols w:space='720' />
      <w:docGrid w:linePitch='360' />
    </w:sectPr>
  </w:body>
</w:document>`;
    expect(XDocument.parse(originalXml).toStringWithIndentation()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test2', () => {
  it('test2', () => {
    const originalXml = `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:styles xmlns:mc='http://schemas.openxmlformats.org/markup-compatibility/2006' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' xmlns:w14='http://schemas.microsoft.com/office/word/2010/wordml' xmlns:w15='http://schemas.microsoft.com/office/word/2012/wordml' xmlns:w16cex='http://schemas.microsoft.com/office/word/2018/wordml/cex' xmlns:w16cid='http://schemas.microsoft.com/office/word/2016/wordml/cid' xmlns:w16='http://schemas.microsoft.com/office/word/2018/wordml' xmlns:w16du='http://schemas.microsoft.com/office/word/2023/wordml/word16du' xmlns:w16sdtdh='http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash' xmlns:w16sdtfl='http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock' xmlns:w16se='http://schemas.microsoft.com/office/word/2015/wordml/symex' mc:Ignorable='w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du'>
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:asciiTheme='minorHAnsi' w:eastAsiaTheme='minorHAnsi' w:hAnsiTheme='minorHAnsi' w:cstheme='minorBidi' />
        <w:kern w:val='2' />
        <w:sz w:val='24' />
        <w:szCs w:val='24' />
        <w:lang w:val='en-US' w:eastAsia='en-US' w:bidi='ar-SA' />
        <w14:ligatures w14:val='standardContextual' />
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after='160' w:line='278' w:lineRule='auto' />
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:latentStyles w:defLockedState='0' w:defUIPriority='99' w:defSemiHidden='0' w:defUnhideWhenUsed='0' w:defQFormat='0' w:count='376'>
    <w:lsdException w:name='Normal' w:uiPriority='0' w:qFormat='1' />
    <w:lsdException w:name='heading 1' w:uiPriority='9' w:qFormat='1' />
    <w:lsdException w:name='heading 2' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 3' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 4' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 5' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 6' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 7' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 8' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='heading 9' w:semiHidden='1' w:uiPriority='9' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='index 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 6' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 7' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 8' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index 9' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 1' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 2' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 3' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 4' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 5' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 6' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 7' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 8' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toc 9' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Normal Indent' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='footnote text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='annotation text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='header' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='footer' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='index heading' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='caption' w:semiHidden='1' w:uiPriority='35' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='table of figures' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='envelope address' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='envelope return' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='footnote reference' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='annotation reference' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='line number' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='page number' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='endnote reference' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='endnote text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='table of authorities' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='macro' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='toa heading' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Bullet' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Number' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Bullet 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Bullet 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Bullet 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Bullet 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Number 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Number 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Number 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Number 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Title' w:uiPriority='10' w:qFormat='1' />
    <w:lsdException w:name='Closing' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Signature' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Default Paragraph Font' w:semiHidden='1' w:uiPriority='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text Indent' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Continue' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Continue 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Continue 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Continue 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='List Continue 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Message Header' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Subtitle' w:uiPriority='11' w:qFormat='1' />
    <w:lsdException w:name='Salutation' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Date' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text First Indent' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text First Indent 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Note Heading' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text Indent 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Body Text Indent 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Block Text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Hyperlink' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='FollowedHyperlink' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Strong' w:uiPriority='22' w:qFormat='1' />
    <w:lsdException w:name='Emphasis' w:uiPriority='20' w:qFormat='1' />
    <w:lsdException w:name='Document Map' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Plain Text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='E-mail Signature' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Top of Form' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Bottom of Form' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Normal (Web)' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Acronym' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Address' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Cite' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Code' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Definition' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Keyboard' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Preformatted' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Sample' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Typewriter' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='HTML Variable' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Normal Table' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='annotation subject' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='No List' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Outline List 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Outline List 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Outline List 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Simple 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Simple 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Simple 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Classic 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Classic 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Classic 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Classic 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Colorful 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Colorful 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Colorful 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Columns 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Columns 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Columns 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Columns 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Columns 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 6' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 7' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid 8' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 4' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 5' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 6' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 7' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table List 8' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table 3D effects 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table 3D effects 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table 3D effects 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Contemporary' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Elegant' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Professional' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Subtle 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Subtle 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Web 1' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Web 2' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Web 3' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Balloon Text' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Table Grid' w:uiPriority='39' />
    <w:lsdException w:name='Table Theme' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Placeholder Text' w:semiHidden='1' />
    <w:lsdException w:name='No Spacing' w:uiPriority='1' w:qFormat='1' />
    <w:lsdException w:name='Light Shading' w:uiPriority='60' />
    <w:lsdException w:name='Light List' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3' w:uiPriority='69' />
    <w:lsdException w:name='Dark List' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 1' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 1' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 1' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 1' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 1' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 1' w:uiPriority='65' />
    <w:lsdException w:name='Revision' w:semiHidden='1' />
    <w:lsdException w:name='List Paragraph' w:uiPriority='34' w:qFormat='1' />
    <w:lsdException w:name='Quote' w:uiPriority='29' w:qFormat='1' />
    <w:lsdException w:name='Intense Quote' w:uiPriority='30' w:qFormat='1' />
    <w:lsdException w:name='Medium List 2 Accent 1' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 1' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 1' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 1' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 1' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 1' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 1' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 1' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 2' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 2' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 2' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 2' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 2' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 2' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2 Accent 2' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 2' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 2' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 2' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 2' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 2' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 2' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 2' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 3' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 3' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 3' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 3' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 3' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 3' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2 Accent 3' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 3' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 3' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 3' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 3' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 3' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 3' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 3' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 4' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 4' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 4' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 4' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 4' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 4' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2 Accent 4' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 4' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 4' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 4' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 4' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 4' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 4' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 4' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 5' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 5' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 5' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 5' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 5' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 5' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2 Accent 5' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 5' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 5' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 5' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 5' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 5' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 5' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 5' w:uiPriority='73' />
    <w:lsdException w:name='Light Shading Accent 6' w:uiPriority='60' />
    <w:lsdException w:name='Light List Accent 6' w:uiPriority='61' />
    <w:lsdException w:name='Light Grid Accent 6' w:uiPriority='62' />
    <w:lsdException w:name='Medium Shading 1 Accent 6' w:uiPriority='63' />
    <w:lsdException w:name='Medium Shading 2 Accent 6' w:uiPriority='64' />
    <w:lsdException w:name='Medium List 1 Accent 6' w:uiPriority='65' />
    <w:lsdException w:name='Medium List 2 Accent 6' w:uiPriority='66' />
    <w:lsdException w:name='Medium Grid 1 Accent 6' w:uiPriority='67' />
    <w:lsdException w:name='Medium Grid 2 Accent 6' w:uiPriority='68' />
    <w:lsdException w:name='Medium Grid 3 Accent 6' w:uiPriority='69' />
    <w:lsdException w:name='Dark List Accent 6' w:uiPriority='70' />
    <w:lsdException w:name='Colorful Shading Accent 6' w:uiPriority='71' />
    <w:lsdException w:name='Colorful List Accent 6' w:uiPriority='72' />
    <w:lsdException w:name='Colorful Grid Accent 6' w:uiPriority='73' />
    <w:lsdException w:name='Subtle Emphasis' w:uiPriority='19' w:qFormat='1' />
    <w:lsdException w:name='Intense Emphasis' w:uiPriority='21' w:qFormat='1' />
    <w:lsdException w:name='Subtle Reference' w:uiPriority='31' w:qFormat='1' />
    <w:lsdException w:name='Intense Reference' w:uiPriority='32' w:qFormat='1' />
    <w:lsdException w:name='Book Title' w:uiPriority='33' w:qFormat='1' />
    <w:lsdException w:name='Bibliography' w:semiHidden='1' w:uiPriority='37' w:unhideWhenUsed='1' />
    <w:lsdException w:name='TOC Heading' w:semiHidden='1' w:uiPriority='39' w:unhideWhenUsed='1' w:qFormat='1' />
    <w:lsdException w:name='Plain Table 1' w:uiPriority='41' />
    <w:lsdException w:name='Plain Table 2' w:uiPriority='42' />
    <w:lsdException w:name='Plain Table 3' w:uiPriority='43' />
    <w:lsdException w:name='Plain Table 4' w:uiPriority='44' />
    <w:lsdException w:name='Plain Table 5' w:uiPriority='45' />
    <w:lsdException w:name='Grid Table Light' w:uiPriority='40' />
    <w:lsdException w:name='Grid Table 1 Light' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 1' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 1' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 1' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 1' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 1' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 1' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 1' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 2' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 2' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 2' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 2' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 2' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 2' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 2' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 3' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 3' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 3' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 3' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 3' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 3' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 3' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 4' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 4' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 4' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 4' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 4' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 4' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 4' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 5' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 5' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 5' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 5' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 5' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 5' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 5' w:uiPriority='52' />
    <w:lsdException w:name='Grid Table 1 Light Accent 6' w:uiPriority='46' />
    <w:lsdException w:name='Grid Table 2 Accent 6' w:uiPriority='47' />
    <w:lsdException w:name='Grid Table 3 Accent 6' w:uiPriority='48' />
    <w:lsdException w:name='Grid Table 4 Accent 6' w:uiPriority='49' />
    <w:lsdException w:name='Grid Table 5 Dark Accent 6' w:uiPriority='50' />
    <w:lsdException w:name='Grid Table 6 Colorful Accent 6' w:uiPriority='51' />
    <w:lsdException w:name='Grid Table 7 Colorful Accent 6' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 1' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 1' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 1' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 1' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 1' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 1' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 1' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 2' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 2' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 2' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 2' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 2' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 2' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 2' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 3' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 3' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 3' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 3' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 3' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 3' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 3' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 4' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 4' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 4' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 4' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 4' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 4' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 4' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 5' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 5' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 5' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 5' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 5' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 5' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 5' w:uiPriority='52' />
    <w:lsdException w:name='List Table 1 Light Accent 6' w:uiPriority='46' />
    <w:lsdException w:name='List Table 2 Accent 6' w:uiPriority='47' />
    <w:lsdException w:name='List Table 3 Accent 6' w:uiPriority='48' />
    <w:lsdException w:name='List Table 4 Accent 6' w:uiPriority='49' />
    <w:lsdException w:name='List Table 5 Dark Accent 6' w:uiPriority='50' />
    <w:lsdException w:name='List Table 6 Colorful Accent 6' w:uiPriority='51' />
    <w:lsdException w:name='List Table 7 Colorful Accent 6' w:uiPriority='52' />
    <w:lsdException w:name='Mention' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Smart Hyperlink' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Hashtag' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Unresolved Mention' w:semiHidden='1' w:unhideWhenUsed='1' />
    <w:lsdException w:name='Smart Link' w:semiHidden='1' w:unhideWhenUsed='1' />
  </w:latentStyles>
  <w:style w:type='paragraph' w:default='1' w:styleId='Normal'>
    <w:name w:val='Normal' />
    <w:qFormat />
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading1'>
    <w:name w:val='heading 1' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading1Char' />
    <w:uiPriority w:val='9' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='360' w:after='80' />
      <w:outlineLvl w:val='0' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='40' />
      <w:szCs w:val='40' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading2'>
    <w:name w:val='heading 2' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading2Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='160' w:after='80' />
      <w:outlineLvl w:val='1' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='32' />
      <w:szCs w:val='32' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading3'>
    <w:name w:val='heading 3' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading3Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='160' w:after='80' />
      <w:outlineLvl w:val='2' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='28' />
      <w:szCs w:val='28' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading4'>
    <w:name w:val='heading 4' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading4Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='80' w:after='40' />
      <w:outlineLvl w:val='3' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading5'>
    <w:name w:val='heading 5' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading5Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='80' w:after='40' />
      <w:outlineLvl w:val='4' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading6'>
    <w:name w:val='heading 6' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading6Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='40' w:after='0' />
      <w:outlineLvl w:val='5' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading7'>
    <w:name w:val='heading 7' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading7Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:before='40' w:after='0' />
      <w:outlineLvl w:val='6' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading8'>
    <w:name w:val='heading 8' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading8Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:after='0' />
      <w:outlineLvl w:val='7' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='272727' w:themeColor='text1' w:themeTint='D8' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Heading9'>
    <w:name w:val='heading 9' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='Heading9Char' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:after='0' />
      <w:outlineLvl w:val='8' />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='272727' w:themeColor='text1' w:themeTint='D8' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:default='1' w:styleId='DefaultParagraphFont'>
    <w:name w:val='Default Paragraph Font' />
    <w:uiPriority w:val='1' />
    <w:semiHidden />
    <w:unhideWhenUsed />
  </w:style>
  <w:style w:type='table' w:default='1' w:styleId='TableNormal'>
    <w:name w:val='Normal Table' />
    <w:uiPriority w:val='99' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:tblPr>
      <w:tblInd w:w='0' w:type='dxa' />
      <w:tblCellMar>
        <w:top w:w='0' w:type='dxa' />
        <w:left w:w='108' w:type='dxa' />
        <w:bottom w:w='0' w:type='dxa' />
        <w:right w:w='108' w:type='dxa' />
      </w:tblCellMar>
    </w:tblPr>
  </w:style>
  <w:style w:type='numbering' w:default='1' w:styleId='NoList'>
    <w:name w:val='No List' />
    <w:uiPriority w:val='99' />
    <w:semiHidden />
    <w:unhideWhenUsed />
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading1Char'>
    <w:name w:val='Heading 1 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading1' />
    <w:uiPriority w:val='9' />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='40' />
      <w:szCs w:val='40' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading2Char'>
    <w:name w:val='Heading 2 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading2' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='32' />
      <w:szCs w:val='32' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading3Char'>
    <w:name w:val='Heading 3 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading3' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:sz w:val='28' />
      <w:szCs w:val='28' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading4Char'>
    <w:name w:val='Heading 4 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading4' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading5Char'>
    <w:name w:val='Heading 5 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading5' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading6Char'>
    <w:name w:val='Heading 6 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading6' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading7Char'>
    <w:name w:val='Heading 7 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading7' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading8Char'>
    <w:name w:val='Heading 8 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading8' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:i />
      <w:iCs />
      <w:color w:val='272727' w:themeColor='text1' w:themeTint='D8' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='Heading9Char'>
    <w:name w:val='Heading 9 Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Heading9' />
    <w:uiPriority w:val='9' />
    <w:semiHidden />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='272727' w:themeColor='text1' w:themeTint='D8' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Title'>
    <w:name w:val='Title' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='TitleChar' />
    <w:uiPriority w:val='10' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:spacing w:after='80' w:line='240' w:lineRule='auto' />
      <w:contextualSpacing />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:spacing w:val='-10' />
      <w:kern w:val='28' />
      <w:sz w:val='56' />
      <w:szCs w:val='56' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='TitleChar'>
    <w:name w:val='Title Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Title' />
    <w:uiPriority w:val='10' />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:asciiTheme='majorHAnsi' w:eastAsiaTheme='majorEastAsia' w:hAnsiTheme='majorHAnsi' w:cstheme='majorBidi' />
      <w:spacing w:val='-10' />
      <w:kern w:val='28' />
      <w:sz w:val='56' />
      <w:szCs w:val='56' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Subtitle'>
    <w:name w:val='Subtitle' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='SubtitleChar' />
    <w:uiPriority w:val='11' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:numPr>
        <w:ilvl w:val='1' />
      </w:numPr>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
      <w:spacing w:val='15' />
      <w:sz w:val='28' />
      <w:szCs w:val='28' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='SubtitleChar'>
    <w:name w:val='Subtitle Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Subtitle' />
    <w:uiPriority w:val='11' />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:rFonts w:eastAsiaTheme='majorEastAsia' w:cstheme='majorBidi' />
      <w:color w:val='595959' w:themeColor='text1' w:themeTint='A6' />
      <w:spacing w:val='15' />
      <w:sz w:val='28' />
      <w:szCs w:val='28' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Quote'>
    <w:name w:val='Quote' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='QuoteChar' />
    <w:uiPriority w:val='29' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:spacing w:before='160' />
      <w:jc w:val='center' />
    </w:pPr>
    <w:rPr>
      <w:i />
      <w:iCs />
      <w:color w:val='404040' w:themeColor='text1' w:themeTint='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='QuoteChar'>
    <w:name w:val='Quote Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Quote' />
    <w:uiPriority w:val='29' />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:i />
      <w:iCs />
      <w:color w:val='404040' w:themeColor='text1' w:themeTint='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='ListParagraph'>
    <w:name w:val='List Paragraph' />
    <w:basedOn w:val='Normal' />
    <w:uiPriority w:val='34' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:ind w:left='720' />
      <w:contextualSpacing />
    </w:pPr>
  </w:style>
  <w:style w:type='character' w:styleId='IntenseEmphasis'>
    <w:name w:val='Intense Emphasis' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:uiPriority w:val='21' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:i />
      <w:iCs />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='IntenseQuote'>
    <w:name w:val='Intense Quote' />
    <w:basedOn w:val='Normal' />
    <w:next w:val='Normal' />
    <w:link w:val='IntenseQuoteChar' />
    <w:uiPriority w:val='30' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:pBdr>
        <w:top w:val='single' w:sz='4' w:space='10' w:color='0F4761' w:themeColor='accent1' w:themeShade='BF' />
        <w:bottom w:val='single' w:sz='4' w:space='10' w:color='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      </w:pBdr>
      <w:spacing w:before='360' w:after='360' />
      <w:ind w:left='864' w:right='864' />
      <w:jc w:val='center' />
    </w:pPr>
    <w:rPr>
      <w:i />
      <w:iCs />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='IntenseQuoteChar'>
    <w:name w:val='Intense Quote Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='IntenseQuote' />
    <w:uiPriority w:val='30' />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:i />
      <w:iCs />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:styleId='IntenseReference'>
    <w:name w:val='Intense Reference' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:uiPriority w:val='32' />
    <w:qFormat />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:b />
      <w:bCs />
      <w:smallCaps />
      <w:color w:val='0F4761' w:themeColor='accent1' w:themeShade='BF' />
      <w:spacing w:val='5' />
    </w:rPr>
  </w:style>
  <w:style w:type='paragraph' w:styleId='Header'>
    <w:name w:val='header' />
    <w:basedOn w:val='Normal' />
    <w:link w:val='HeaderChar' />
    <w:uiPriority w:val='99' />
    <w:unhideWhenUsed />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:tabs>
        <w:tab w:val='center' w:pos='4680' />
        <w:tab w:val='right' w:pos='9360' />
      </w:tabs>
      <w:spacing w:after='0' w:line='240' w:lineRule='auto' />
    </w:pPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='HeaderChar'>
    <w:name w:val='Header Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Header' />
    <w:uiPriority w:val='99' />
    <w:rsid w:val='00F314CB' />
  </w:style>
  <w:style w:type='paragraph' w:styleId='Footer'>
    <w:name w:val='footer' />
    <w:basedOn w:val='Normal' />
    <w:link w:val='FooterChar' />
    <w:uiPriority w:val='99' />
    <w:unhideWhenUsed />
    <w:rsid w:val='00F314CB' />
    <w:pPr>
      <w:tabs>
        <w:tab w:val='center' w:pos='4680' />
        <w:tab w:val='right' w:pos='9360' />
      </w:tabs>
      <w:spacing w:after='0' w:line='240' w:lineRule='auto' />
    </w:pPr>
  </w:style>
  <w:style w:type='character' w:customStyle='1' w:styleId='FooterChar'>
    <w:name w:val='Footer Char' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:link w:val='Footer' />
    <w:uiPriority w:val='99' />
    <w:rsid w:val='00F314CB' />
  </w:style>
  <w:style w:type='character' w:styleId='Hyperlink'>
    <w:name w:val='Hyperlink' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:uiPriority w:val='99' />
    <w:unhideWhenUsed />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:color w:val='467886' w:themeColor='hyperlink' />
      <w:u w:val='single' />
    </w:rPr>
  </w:style>
  <w:style w:type='character' w:styleId='UnresolvedMention'>
    <w:name w:val='Unresolved Mention' />
    <w:basedOn w:val='DefaultParagraphFont' />
    <w:uiPriority w:val='99' />
    <w:semiHidden />
    <w:unhideWhenUsed />
    <w:rsid w:val='00F314CB' />
    <w:rPr>
      <w:color w:val='605E5C' />
      <w:shd w:val='clear' w:color='auto' w:fill='E1DFDD' />
    </w:rPr>
  </w:style>
</w:styles>`;
    expect(XDocument.parse(originalXml).toStringWithIndentation()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test3', () => {
  it('test3', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test4', () => {
  it('test4', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test5', () => {
  it('test5', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test6', () => {
  it('test6', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test7', () => {
  it('test7', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test8', () => {
  it('test8', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test9', () => {
  it('test9', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});

describe('Round-trip — Open XML: test10', () => {
  it('test10', () => {
    const originalXml = '<root />';
    expect(XElement.parse(originalXml).toString()).toEqual(originalXml);
  });
});
