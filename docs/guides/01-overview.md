---
title: Overview
group: Guides
category: Guides
---

# LtXmlTs Overview

**LtXmlTs** (LINQ to XML for TypeScript) is a TypeScript port of .NET's
`System.Xml.Linq` namespace. It brings the same tree-building, parsing, querying,
and serialisation API that C# developers know as **LINQ to XML** into the
TypeScript / JavaScript ecosystem.

## Who Is This For?

- Developers already familiar with C# / .NET LINQ to XML who want the same
  programming model in TypeScript.
- Anyone who needs a rich, in-memory XML API that goes beyond simple DOM
  manipulation -- supporting namespaces, functional construction, declarative
  queries, and pretty-printed serialisation out of the box.

## Installation

```bash
npm install ltxmlts
```

## Class Hierarchy

```
XObject
├── XAttribute
└── XNode
    ├── XText
    ├── XComment
    ├── XCData
    ├── XProcessingInstruction
    └── XContainer
        ├── XElement
        └── XDocument
```

**Supporting types:** `XName`, `XNamespace`, `XDeclaration`, `XmlParseError`

## Quick Start

### Building a Tree

```typescript
import { XElement, XAttribute } from "ltxmlts";

const root = new XElement("catalog",
  new XElement("book",
    new XAttribute("isbn", "978-0-00-000000-0"),
    new XElement("title", "TypeScript in Depth"),
    new XElement("price", "29.99"),
  ),
  new XElement("book",
    new XAttribute("isbn", "978-0-11-111111-1"),
    new XElement("title", "XML Essentials"),
    new XElement("price", "19.99"),
  ),
);

console.log(root.toString());
```

### Parsing XML

```typescript
import { XElement } from "ltxmlts";

const xml = `<catalog>
  <book isbn="978-0-00-000000-0">
    <title>TypeScript in Depth</title>
    <price>29.99</price>
  </book>
</catalog>`;

const catalog = XElement.parse(xml);
```

### Querying

```typescript
// All <title> elements anywhere in the tree
const titles = catalog.descendants("title");

// Filter with standard array methods
const expensive = catalog
  .descendants("book")
  .filter((b) => parseFloat(b.element("price")!.value) > 20);

// Attribute access
const isbn = catalog.descendants("book")[0].attribute("isbn")?.value;
```

## Class Survey

| Class | Description |
|---|---|
| `XObject` | Abstract base class for all XML tree items. Provides `parent` and node-type information. |
| `XNode` | Abstract base for content nodes (elements, text, comments, etc.). Adds sibling navigation and `remove()`. |
| `XContainer` | Abstract base for nodes that can contain children (`XElement`, `XDocument`). Provides `add()`, `nodes()`, `elements()`, `descendants()`, and more. |
| `XElement` | An XML element. Supports attributes, child content, functional construction, parsing (`XElement.parse()`), and serialisation (`toString()`). |
| `XDocument` | Represents a complete XML document, optionally with an `XDeclaration`. |
| `XAttribute` | A name/value attribute attached to an `XElement`. |
| `XText` | A text node. |
| `XCData` | A CDATA section (subclass of `XText`). |
| `XComment` | An XML comment. |
| `XProcessingInstruction` | An XML processing instruction (`<?target data?>`). |
| `XName` | An expanded XML name (namespace URI + local name). Supports Clark notation: `"{uri}local"`. |
| `XNamespace` | Represents an XML namespace URI. Provides static `none`, `xml`, and `xmlns` instances. |
| `XDeclaration` | Stores the XML declaration (version, encoding, standalone). |
| `XmlParseError` | Error subclass thrown when XML parsing fails, with `line`, `column`, and optional `filePath` properties. |

## Namespace Handling

Namespaces work via `XNamespace` and `XName`, following the same pattern as
`System.Xml.Linq`.

```typescript
import { XElement, XAttribute, XNamespace } from "ltxmlts";

const ns = XNamespace.get("http://example.com/books");

const root = new XElement(ns.getName("catalog"),
  new XAttribute(XNamespace.xmlns.getName("bk"), ns.uri),
  new XElement(ns.getName("book"),
    new XElement(ns.getName("title"), "TypeScript in Depth"),
  ),
);

console.log(root.toString());
// <bk:catalog xmlns:bk="http://example.com/books">
//   <bk:book>
//     <bk:title>TypeScript in Depth</bk:title>
//   </bk:book>
// </bk:catalog>
```

You can also use Clark notation strings directly:

```typescript
const title = root.descendants("{http://example.com/books}title")[0];
```

## Sequence Extension Methods

LtXmlTs provides the `XSequence` class and a set of standalone helper functions
that mirror .NET's `System.Xml.Linq.Extensions` methods. These let you query
across collections of nodes -- for example, getting all descendants of all
elements in an array.

See the [XSequence Extension Methods](./02-xsequence-extension-methods.md) guide
for full details, method reference, and examples.

## Error Handling

When `XElement.parse()` or `XDocument.parse()` encounters malformed XML, it
throws an `XmlParseError`:

```typescript
import { XElement, XmlParseError } from "ltxmlts";

try {
  const el = XElement.parse("<root><unclosed>");
} catch (err) {
  if (err instanceof XmlParseError) {
    console.error(`Parse error at line ${err.line}, column ${err.column}`);
    console.error(err.message);
  }
}
```

`XmlParseError` extends `Error` and exposes:

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error description |
| `line` | `number \| undefined` | 1-based line number where the error occurred |
| `column` | `number \| undefined` | 1-based column number |
| `filePath` | `string \| undefined` | File path, when parsing was initiated from a file |
