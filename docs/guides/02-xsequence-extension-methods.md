---
title: XSequence Extension Methods
group: Guides
category: Guides
---

# XSequence Extension Methods

## Overview

In .NET's `System.Xml.Linq`, the static `Extensions` class provides methods
that operate on `IEnumerable<T>` sequences of XML nodes -- for example,
`elements.Descendants("item")` returns every `<item>` descendant across *all*
elements in the source sequence.

LtXmlTs mirrors this pattern with the `XSequence<T>` class and a matching set
of standalone functions. Every method collects results from each item in the
source sequence and returns them as a new `XSequence` (or plain array, for the
standalone versions).

## The `xseq()` Factory Function

Wrap any `T[]` (where `T` extends `XNode | XAttribute`) in an `XSequence` to
gain access to the chaining API:

```typescript
import { XElement, xseq } from "ltxmlts";

const root = XElement.parse(`
  <catalog>
    <section name="fiction">
      <book><title>A</title></book>
      <book><title>B</title></book>
    </section>
    <section name="science">
      <book><title>C</title></book>
    </section>
  </catalog>
`);

const titles = xseq(root.elements("section"))
  .elements("book")
  .elements("title")
  .toArray();

// titles contains the three <title> elements
```

## Retrieving Results

`XSequence` is iterable, so you can use either approach:

```typescript
// Convert to a plain array
const arr = seq.toArray();

// Iterate directly
for (const el of seq) {
  console.log(el.toString());
}
```

## Standalone Functions

Every `XSequence` method is also available as a standalone function that accepts
and returns plain arrays. This is convenient when you do not need chaining:

```typescript
import { elements, descendants } from "ltxmlts";

const sections = root.elements("section");
const allBooks = elements(sections, "book");
const allTitles = descendants(allBooks, "title");
```

## Method Reference

### ancestors

Return the ancestors of every node in the sequence.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to ancestors with this name |

**Returns:** `XSequence<XElement>`

```typescript
const bookElements = root.descendants("book");
const containers = xseq(bookElements).ancestors().toArray();
// returns the <section> and <catalog> ancestors of each <book>
```

### ancestorsAndSelf

Return each element in the source sequence together with its ancestors.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to elements with this name |

**Returns:** `XSequence<XElement>`

```typescript
const books = root.descendants("book");
const selfAndUp = xseq(books).ancestorsAndSelf().toArray();
// each <book> plus its ancestor chain
```

### attributes

Return the attributes of every element in the sequence.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to attributes with this name |

**Returns:** `XSequence<XAttribute>`

```typescript
const sections = root.elements("section");
const names = xseq(sections).attributes("name").toArray();
// [XAttribute(name="fiction"), XAttribute(name="science")]
```

### descendants

Return all descendant elements of every element in the sequence.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to descendants with this name |

**Returns:** `XSequence<XElement>`

```typescript
const sections = root.elements("section");
const allTitles = xseq(sections).descendants("title").toArray();
```

### descendantsAndSelf

Return each source element and all of its descendant elements.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to elements with this name |

**Returns:** `XSequence<XElement>`

```typescript
const sections = root.elements("section");
const all = xseq(sections).descendantsAndSelf().toArray();
// every <section> and every element inside each section
```

### descendantNodes

Return all descendant nodes (of any type) of every element in the sequence.

**Parameters:** none

**Returns:** `XSequence<XNode>`

```typescript
const sections = root.elements("section");
const allNodes = xseq(sections).descendantNodes().toArray();
// includes XElement, XText, XComment, etc.
```

### elements

Return the direct child elements of every container in the sequence.

| Parameter | Type | Description |
|---|---|---|
| `name` | `XName \| string` (optional) | Filter to children with this name |

**Returns:** `XSequence<XElement>`

```typescript
const sections = root.elements("section");
const books = xseq(sections).elements("book").toArray();
```

### nodes

Return the direct child nodes of every container in the sequence.

**Parameters:** none

**Returns:** `XSequence<XNode>`

```typescript
const books = root.descendants("book");
const childNodes = xseq(books).nodes().toArray();
```

### inDocumentOrder

Sort the items in the sequence into document order.

**Parameters:** none

**Returns:** `XSequence<T>` (same item type as the source)

```typescript
const mixed = [...root.descendants("title"), ...root.descendants("book")];
const sorted = xseq(mixed).inDocumentOrder().toArray();
// items are now in the order they appear in the XML document
```

### remove

Remove every item in the sequence from its parent.

**Parameters:** none

**Returns:** `void`

```typescript
// Remove all <book> elements from the tree
xseq(root.descendants("book")).remove();
```
