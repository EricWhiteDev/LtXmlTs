# LtXmlTs — LINQ to XML for TypeScript

LtXmlTs is a TypeScript port of .NET's LINQ to XML (`System.Xml.Linq`) library. It provides a rich, immutable-friendly XML object model with fluent querying, functional tree construction, and round-trip serialization.

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

Supporting types: `XName`, `XNamespace`, `XDeclaration`, `XmlParseError`

## Quick Start

```typescript
import { XElement, XAttribute, XDocument, XDeclaration } from 'ltxmlts';

// Build a tree
const doc = new XDocument(
  new XDeclaration('1.0', 'utf-8', ''),
  new XElement('books',
    new XElement('book',
      new XAttribute('id', '1'),
      new XElement('title', 'Clean Code'),
    ),
  ),
);

console.log(doc.toString());
// <?xml version='1.0' encoding='utf-8'?><books><book id='1'><title>Clean Code</title></book></books>

// Query
const title = doc.root?.element('book')?.element('title')?.value;
// 'Clean Code'
```

## Parsing

Parse XML from a string:

```typescript
const el = XElement.parse('<items><item id="1"/><item id="2"/></items>');
el.elements('item').length; // 2

const doc = XDocument.parse("<?xml version='1.0'?><root/>");
doc.declaration?.version; // '1.0'
```

## Loading from Files

Load XML directly from a file path — synchronously or asynchronously:

```typescript
// Synchronous
const el  = XElement.load('/path/to/data.xml');
const doc = XDocument.load('/path/to/doc.xml');

// Asynchronous
const el  = await XElement.loadAsync('/path/to/data.xml');
const doc = await XDocument.loadAsync('/path/to/doc.xml');
```

Parse errors thrown by `load`/`loadAsync` are `XmlParseError` instances with a `filePath` field set to the path that was loaded, making it easy to surface useful diagnostics:

```typescript
import { XmlParseError } from 'ltxmlts';

try {
  XDocument.load('/data/config.xml');
} catch (e) {
  if (e instanceof XmlParseError) {
    console.error(`Parse error in ${e.filePath} at line ${e.line}, column ${e.column}`);
  }
}
```

## Sequence Extension Methods

`XSequence<T>` and the `xseq()` factory bring LINQ-style sequence operations over arrays of XML objects — equivalent to `System.Xml.Linq.Extensions`:

```typescript
import { xseq, ancestors, descendants, elements, remove } from 'ltxmlts';

const root = XElement.parse('<root><a><b/><c/></a><a><d/></a></root>');

// Fluent API
const bAndC = xseq(root.elements('a'))
  .elements()
  .toArray(); // [<b/>, <c/>, <d/>]

// Standalone functions (same results)
const allAs = descendants([root], 'a');

// Remove a set of nodes safely
remove(root.descendants('a'));
```

**XSequence methods:** `ancestors`, `ancestorsAndSelf`, `attributes`, `descendants`, `descendantsAndSelf`, `descendantNodes`, `elements`, `nodes`, `inDocumentOrder`, `remove`, `toArray`

**Standalone exports:** `ancestors`, `ancestorsAndSelf`, `attributes`, `descendants`, `descendantsAndSelf`, `descendantNodes`, `elements`, `nodes`, `inDocumentOrder`, `remove`

## Namespaces

```typescript
import { XNamespace, XElement, XAttribute } from 'ltxmlts';

const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');

const para = new XElement(W + 'p',
  new XAttribute(XNamespace.xmlns + 'w', W.uri),
  new XElement(W + 'r',
    new XElement(W + 't', 'Hello'),
  ),
);

para.toString();
// <w:p xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>
//   <w:r><w:t>Hello</w:t></w:r>
// </w:p>
```

The `xml:` prefix (`http://www.w3.org/XML/1998/namespace`) is always resolved to `xml` without emitting an `xmlns:xml` declaration.

## Error Handling

All parse and load methods throw `XmlParseError` on malformed input:

| Field | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable SAX parser error |
| `line` | `number?` | One-based line number |
| `column` | `number?` | One-based column number |
| `filePath` | `string?` | Set only by `load`/`loadAsync` |

## Documentation

Full API reference and guides are published at **[ericwhitedev.github.io/LtXmlTs](https://ericwhitedev.github.io/LtXmlTs/)**.

To build the documentation locally:

```bash
npm run docs
```

Output is written to `docs/api/`. Open `docs/api/index.html` in a browser.

## License

MIT © 2026 Eric White
