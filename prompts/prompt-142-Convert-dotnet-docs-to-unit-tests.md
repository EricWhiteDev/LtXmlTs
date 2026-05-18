# Plan: Compat-Test suite mirroring .NET LINQ to XML documentation examples

## Context

The LtXmlTs project is a TypeScript port of .NET's `System.Xml.Linq`. The .NET reference docs at `https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq?view=netframework-4.8.1` contain C# examples on most type and member pages — typically a C# snippet followed by a code block introduced by *"This example produces the following output:"*. There are also ~98 conceptual ("How to" / overview) articles under `/dotnet/standard/linq/` that each contain one or more such examples.

We want to **port each of those C# examples to a TypeScript test that exercises the LtXmlTs port and compares its captured output string-for-string against the documented expected output.** When the captured output diverges, the test should fail — giving us a continually-checked compatibility surface against the .NET reference.

These tests are an **independent suite**: file name pattern `Compat-Test-<topic>.test.ts`, kept **flat in `tests/`** alongside existing tests — the filename prefix is the distinguishing marker. Read-only with respect to existing tests. A path filter (`npx vitest run tests/Compat-Test-`) runs the compat suite alone.

Two outputs are produced in this plan:
- **Table 1** — every C# documentation topic with a portable example (the convertible list).
- **Table 2** — every API / topic that cannot be converted, with the reason.

The plan does NOT write tests yet — it lays out the topic inventory, the test-harness design, and the execution batches.

---

## Test infrastructure design

### File layout

```
tests/
  Compat-Test-_helpers.ts                       # output capture + assertion helpers
  Compat-Test-XAttribute-Name.test.ts
  Compat-Test-XAttribute-Value.test.ts
  Compat-Test-XAttribute-class-overview.test.ts
  Compat-Test-XElement-Add-Object.test.ts
  Compat-Test-XElement-class-overview.test.ts
  ...
  Compat-Test-functional-construction.test.ts
  Compat-Test-create-xml-trees.test.ts
  ...
```

**Naming convention.** `Compat-Test-<Class>-<Member>.test.ts` for reference topics, where array overloads get an `Array` suffix (e.g. `Compat-Test-XElement-Add-Object.test.ts` vs `Compat-Test-XElement-Add-ObjectArray.test.ts`). Conceptual articles use their slug: `Compat-Test-<slug>.test.ts`. All files live flat in `tests/`.

### Output capture

The .NET examples use `Console.WriteLine(...)`. The TypeScript equivalent must "print" each value to a buffer and compare the joined buffer to the documented expected output.

```ts
// tests/compat/_helpers.ts
import { XAttribute, XCData, XComment, XContainer, XDeclaration, XDocument,
         XElement, XName, XNamespace, XNode, XProcessingInstruction, XText } from 'ltxmlts';

export function createConsole() {
  const buf: string[] = [];
  return {
    writeLine(v: unknown) { buf.push(formatLikeDotNet(v)); },
    write(v: unknown)    { buf.push(stringify(v)); },
    text(): string       { return buf.join('\n'); },
  };
}

// Matches the .NET Console.WriteLine(obj) convention:
// - XElement / XDocument / XNode / XAttribute / XName / XNamespace → ToString()
// - numbers/booleans → C# culture-invariant format
// - everything else → String()
function formatLikeDotNet(v: unknown): string { /* … */ }

export function expectMatches(actual: string, expectedBlock: string) {
  // normalize line endings; the .NET docs use LF; XElement.ToString() uses
  // the platform indent. Strip trailing whitespace per line and trailing
  // newline. If serialization mismatch is intentional and the port behaves
  // differently, document the divergence in a comment in the test.
  expect(normalize(actual)).toBe(normalize(expectedBlock));
}
```

The helper centralizes the formatting / whitespace contract so individual tests stay one-shot:

```ts
it('XAttribute.Name retrieves the expanded name', () => {
  const con = createConsole();
  // ----- C# original -----
  // XElement root = new XElement("Root", new XAttribute("Att", "content"));
  // XAttribute att = root.FirstAttribute;
  // Console.WriteLine(att.Name);
  // -----------------------
  const root = new XElement('Root', new XAttribute('Att', 'content'));
  const att = root.firstAttribute!;
  con.writeLine(att.name);
  expectMatches(con.text(), 'Att');
});
```

### Casing translation

| C# | TypeScript |
|---|---|
| `XAttribute.Name` | `xAttribute.name` |
| `XAttribute.Value` | `xAttribute.value` |
| `XElement.Add(...)` | `xElement.add(...)` |
| `XContainer.FirstNode` | `xContainer.firstNode` |
| `XNode.DeepEquals(a, b)` (static) | `XNode.deepEquals(a, b)` |
| `XNamespace.Get(uri)` | `XNamespace.get(uri)` |
| `XName.Get("ns", "local")` | `XName.get(ns, 'local')` |
| Implicit `string → XName` (C# operator) | `XName.get('name')` (or pass the string directly where the API accepts `XName \| string`) |
| `XNamespace + "local"` operator | same: `ns + 'local'` works in TS (template/concatenation produces Clark `{uri}local` that the API parses) |
| `(int)attribute` cast operator | `Number(attr.value)` (or `parseInt(attr.value, 10)`) |
| `(DateTime)attribute` | `new Date(attr.value)` |
| LINQ query syntax `from x in xs where ... select ...` | array `.filter(...).map(...)` or `xseq(xs).where(...)` if available |
| `xs.ToList()` / `xs.ToArray()` | already arrays |

### Methodology for porting one example

1. Open the source .NET page.
2. Extract the C# snippet and the expected-output block.
3. Translate the C# snippet line-by-line to TypeScript, replacing `Console.WriteLine` with `con.writeLine`, and applying casing/operator translations from the table above.
4. Compare to the expected-output block via `expectMatches`.
5. If the test fails because of a documented serialization divergence (whitespace, attribute order, prefix generation), capture the divergence as a `it.skip(...)` with a `// COMPAT: port differs because …` note. **Do NOT** "fix" the test to match the port — the suite's value is in flagging drift.

---

## Table 1 — Convertible topics

The table is grouped by source: API reference (class + members) first, then conceptual articles.

### A. API reference — class overview pages

Every class overview page is itself a candidate (the overview Remarks section often contains an example). The overview-URL pattern is `https://learn.microsoft.com/en-us/dotnet/api/<type-uid>?view=netframework-4.8.1`.

| C# API | TS API | URL | Convertible? | Notes |
|---|---|---|---|---|
| `XAttribute` class | `XAttribute` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute?view=netframework-4.8.1 | yes | overview Remarks page; namespace declarations subsection has examples |
| `XCData` class | `XCData` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcdata?view=netframework-4.8.1 | yes | |
| `XComment` class | `XComment` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcomment?view=netframework-4.8.1 | yes | |
| `XContainer` class | `XContainer` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xcontainer?view=netframework-4.8.1 | yes | |
| `XDeclaration` class | `XDeclaration` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdeclaration?view=netframework-4.8.1 | yes | |
| `XDocument` class | `XDocument` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocument?view=netframework-4.8.1 | **yes — verified** | "creates a document, adds a comment, composes another using a query" — output is a 6-line XML block. Direct port. |
| `XDocumentType` class | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xdocumenttype?view=netframework-4.8.1 | **no** | TS port has no XDocumentType (see Table 2) |
| `XElement` class | `XElement` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xelement?view=netframework-4.8.1 | **yes — verified** | Two examples on overview: filter by int cast, plus namespace variant |
| `XName` class | `XName` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xname?view=netframework-4.8.1 | yes | overview Remarks may link to supplemental remarks page (also worth checking) |
| `XNamespace` class | `XNamespace` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnamespace?view=netframework-4.8.1 | yes | |
| `XNode` class | `XNode` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnode?view=netframework-4.8.1 | yes | abstract; example may use derived types |
| `XNodeDocumentOrderComparer` | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnodedocumentordercomparer?view=netframework-4.8.1 | **no** | Not in TS port (see Table 2) |
| `XNodeEqualityComparer` | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xnodeequalitycomparer?view=netframework-4.8.1 | **no** | Not in TS port (see Table 2) |
| `XObject` class | `XObject` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xobject?view=netframework-4.8.1 | yes | annotation/events |
| `XObjectChangeEventArgs` | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xobjectchangeeventargs?view=netframework-4.8.1 | **no** | TS port has no XObject change events |
| `XProcessingInstruction` | `XProcessingInstruction` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xprocessinginstruction?view=netframework-4.8.1 | yes | |
| `XStreamingElement` | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xstreamingelement?view=netframework-4.8.1 | **no** | Not in TS port (see Table 2) |
| `XText` class | `XText` | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xtext?view=netframework-4.8.1 | yes | |
| `Extensions` class | standalone fns + XSequence | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.extensions?view=netframework-4.8.1 | yes | overview Remarks |
| `LoadOptions` enum | `LoadOptions` (n/a — TS uses string options) | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.loadoptions?view=netframework-4.8.1 | **partial** | Test only the values the TS port supports; flag others non-portable per Table 2 |
| `SaveOptions` enum | `SaveOptions` (n/a — `toString` vs `toStringWithIndentation`) | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.saveoptions?view=netframework-4.8.1 | partial | |
| `ReaderOptions` enum | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.readeroptions?view=netframework-4.8.1 | **no** | XmlReader is not in port |
| `XObjectChange` enum | — | https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xobjectchange?view=netframework-4.8.1 | **no** | No change events |

### B. API reference — member pages

URL pattern: `https://learn.microsoft.com/en-us/dotnet/api/<type-uid>.<member-uid>?view=netframework-4.8.1`. Each overload typically has its own page (the URL fragment specifies overload). Member counts below are verified from the class overview tables.

Convention used in the rest of this table: **per-class one-line summary + verified URL prefix**. Per-member rows do not enumerate every overload here — that step happens during execution (one WebFetch per page, generating one test per example). Execution-phase rule: **one C# example block on the page → one test case**. Pages without an example get skipped (no test).

#### B.1 — XAttribute (member URL prefix `system.xml.linq.xattribute.<member>`)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `XAttribute(XAttribute)` | `new XAttribute(other)` | yes | copy ctor |
| `XAttribute(XName, Object)` | `new XAttribute(name, value)` | yes | |
| `EmptySequence` | — | partial | TS exposes `[]`; test the semantic equivalent |
| `IsNamespaceDeclaration` | `.isNamespaceDeclaration` | yes | |
| `Name` | `.name` | yes | |
| `NextAttribute` | `.nextAttribute` | yes | |
| `NodeType` | `.nodeType` | yes | |
| `PreviousAttribute` | `.previousAttribute` | yes | |
| `Value` | `.value` (get/set) | yes | |
| `Remove()` | `.remove()` | yes | |
| `SetValue(Object)` | `.setValue(string)` | yes | TS only accepts string; test demonstrating int/bool input becomes `String(123)` |
| `ToString()` | `.toString()` | yes | |
| `Explicit(XAttribute to X)` (25 cast operator overloads) | `Number(attr.value)`, `new Date(attr.value)`, etc. | partial | Each docs page has an example; port it using JS coercion. **Operator overload not portable; semantics are.** Some Nullable<T> overloads test `attr === null` behavior; in TS, model with `attr ?? defaultValue`. |
| Inherited from XObject (Annotation, Annotations, AddAnnotation, RemoveAnnotations × `(Type)` and `<T>()` overloads) | `.addAnnotation`, `.annotation`, `.annotations`, `.removeAnnotations` | yes — TS port supports ctor-based annotations | Use `class FooAnno {}` instead of C# `typeof(Foo)` |

#### B.2 — XCData / XComment / XText / XProcessingInstruction (small leaf classes)

| Class | Members | Convertible |
|---|---|---|
| XCData | ctor(String), ctor(XCData), NodeType, WriteTo, WriteToAsync, inherited ToString | yes (skip WriteTo*) |
| XComment | ctor(String), ctor(XComment), NodeType, Value, WriteTo, WriteToAsync | yes (skip WriteTo*) |
| XText | ctor(String), ctor(XText), NodeType, Value, WriteTo, WriteToAsync | yes (skip WriteTo*) |
| XProcessingInstruction | ctor(String, String), ctor(XProcessingInstruction), Data, NodeType, Target, WriteTo, WriteToAsync | yes (skip WriteTo*) |

URL pattern: `system.xml.linq.<class>.<member>`.

#### B.3 — XDeclaration

| C# Member | TS member | Convertible |
|---|---|---|
| `XDeclaration(String, String, String)` | `new XDeclaration(v, e, s)` | yes |
| `XDeclaration(XDeclaration)` | copy ctor | yes |
| `Encoding` / `Standalone` / `Version` | `.encoding` / `.standalone` / `.version` | yes |
| `ToString()` | `.toString()` | yes |

#### B.4 — XContainer (8 properties, ~25 methods)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `FirstNode` / `LastNode` | `.firstNode` / `.lastNode` | yes | |
| `Add(Object)` / `Add(Object[])` | `.add(...content)` | yes | Two separate doc pages each with their own example |
| `AddFirst(Object)` / `AddFirst(Object[])` | `.addFirst(...content)` | yes | |
| `DescendantNodes()` | `.descendantNodes()` | yes | |
| `Descendants()` / `Descendants(XName)` | `.descendants()` / `.descendants(name)` | yes | |
| `Element(XName)` | `.element(name)` | yes | |
| `Elements()` / `Elements(XName)` | `.elements()` / `.elements(name)` | yes | |
| `Nodes()` | `.nodes()` | yes | |
| `RemoveNodes()` | `.removeNodes()` | yes | |
| `ReplaceNodes(Object)` / `(Object[])` | `.replaceNodes(...content)` | yes | |
| `CreateWriter()` | — | **no** | XmlWriter not in port |
| Inherited Add/Remove ops | per XNode | see B.5 | |

#### B.5 — XNode (8 properties, ~25 methods)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `DocumentOrderComparer` (static) | — | no — TS exposes `inDocumentOrder()` instead | Test the semantic equivalent rather than the comparer object |
| `EqualityComparer` (static) | — | no — TS exposes `XNode.deepEquals` | |
| `NextNode` / `PreviousNode` | `.nextNode` / `.previousNode` | yes | |
| `AddAfterSelf(Object)` / `(Object[])` | `.addAfterSelf(...content)` | yes | |
| `AddBeforeSelf(Object)` / `(Object[])` | `.addBeforeSelf(...content)` | yes | |
| `Ancestors()` / `Ancestors(XName)` | `.ancestors()` / `.ancestors(name)` | yes | |
| `CompareDocumentOrder(XNode, XNode)` | — | partial | Test by sorting via `inDocumentOrder()` and checking positions |
| `DeepEquals(XNode, XNode)` (static) | `XNode.deepEquals(a, b)` | yes | |
| `ElementsAfterSelf()` / `(XName)` | `.elementsAfterSelf()` / `(name)` | yes | |
| `ElementsBeforeSelf()` / `(XName)` | `.elementsBeforeSelf()` / `(name)` | yes | |
| `IsAfter(XNode)` / `IsBefore(XNode)` | — | no (not in TS port) | flag in Table 2 |
| `NodesAfterSelf()` / `NodesBeforeSelf()` | `.nodesAfterSelf()` / `.nodesBeforeSelf()` | yes | |
| `ReplaceWith(Object)` / `(Object[])` | `.replaceWith(...content)` | yes | |
| `Remove()` | `.remove()` | yes | |
| `ToString()` / `ToString(SaveOptions)` | `.toString()` / `.toStringWithIndentation()` | partial | SaveOptions enum mapping per port |
| `CreateReader()` / `(ReaderOptions)` | — | **no** — XmlReader | |
| `ReadFrom(XmlReader)` / `ReadFromAsync` | — | **no** — XmlReader | |
| `WriteTo(XmlWriter)` / `WriteToAsync` | — | **no** — XmlWriter | |

#### B.6 — XObject (4 properties, 11 methods, 2 events)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `BaseUri` | — | **no** — not in TS port (see Table 2) | |
| `Document` | `.document` (getter) | yes | |
| `NodeType` | `.nodeType` | yes | |
| `Parent` | `.parent` | yes | |
| `AddAnnotation(Object)` | `.addAnnotation(o)` | yes | |
| `Annotation(Type)` / `Annotation<T>()` | `.annotation(ctor)` | yes — TS uses ctor instead of Type | |
| `Annotations(Type)` / `Annotations<T>()` | `.annotations(ctor)` | yes | |
| `RemoveAnnotations(Type)` / `<T>()` / `()` | `.removeAnnotations(ctor?)` | yes | |
| `Changed` / `Changing` events | — | **no** — TS port has no events | |

#### B.7 — XElement (5 ctors, 16 properties, ~55 methods, 25 cast operators)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `XElement(XElement)` | `new XElement(other)` | yes | |
| `XElement(XName)` | `new XElement(name)` | yes | |
| `XElement(XName, Object)` | `new XElement(name, content)` | yes | |
| `XElement(XName, Object[])` | `new XElement(name, ...content)` | yes | |
| `XElement(XStreamingElement)` | — | **no** | |
| `EmptySequence` | — | partial — use `[]` | |
| `FirstAttribute` / `LastAttribute` | `.firstAttribute` / `.lastAttribute` | yes | |
| `HasAttributes` / `HasElements` / `IsEmpty` | `.hasAttributes` / `.hasElements` / `.isEmpty` | yes | |
| `Name` (get/set) | `.name` (get only in TS — see Table 2) | partial | rename-element examples need TS workaround |
| `NodeType` | `.nodeType` | yes | |
| `Value` (get/set) | `.value` | yes | |
| `Attribute(XName)` | `.attribute(name)` | yes | |
| `Attributes()` / `Attributes(XName)` | `.attributes()` / `.attributes(name)` | yes | |
| `AncestorsAndSelf()` / `(XName)` | `.ancestorsAndSelf()` / `(name)` | yes | |
| `DescendantNodesAndSelf()` | `.descendantNodesAndSelf()` | yes | |
| `DescendantsAndSelf()` / `(XName)` | `.descendantsAndSelf()` / `(name)` | yes | |
| `GetDefaultNamespace()` | — | partial — see Table 2 | |
| `GetNamespaceOfPrefix(String)` | — | partial — see Table 2 | |
| `GetPrefixOfNamespace(XNamespace)` | — | partial — see Table 2 | |
| `Load(String)` / `Load(String, LoadOptions)` | `XElement.load(path)` / `loadAsync(path)` | yes | the file-path overload only |
| `Load(Stream)` / `(TextReader)` / `(XmlReader)` (+ LoadAsync variants) | — | **no** — Stream/TextReader/XmlReader not in port | |
| `Parse(String)` / `(String, LoadOptions)` | `XElement.parse(xml)` | yes — LoadOptions partial | |
| `RemoveAll()` | `.removeAll()` | yes | |
| `RemoveAttributes()` | `.removeAttributes()` | yes | |
| `ReplaceAll(Object)` / `(Object[])` | `.replaceAll(...content)` | yes | |
| `ReplaceAttributes(Object)` / `(Object[])` | `.replaceAttributes(...content)` | yes | |
| `Save(String)` / `(String, SaveOptions)` | — | partial | TS port may have file save; check before porting |
| `Save(Stream)` / `(TextWriter)` / `(XmlWriter)` (+ async) | — | **no** | |
| `SetAttributeValue(XName, Object)` | `.setAttributeValue(name, value)` | yes | |
| `SetElementValue(XName, Object)` | `.setElementValue(name, value)` | yes | |
| `SetValue(Object)` | TS uses `.value =` assignment | partial | |
| `ToString()` / `ToString(SaveOptions)` | `.toString()` / `.toStringWithIndentation()` | yes — partial mapping | |
| `WriteTo(XmlWriter)` / `WriteToAsync` | — | **no** | |
| 25 `Explicit(XElement to X)` cast operators | `Number(el.value)`, etc. | partial — see XAttribute notes | |
| `IXmlSerializable.GetSchema/ReadXml/WriteXml` | — | **no** — XmlReader/Writer | |

#### B.8 — XDocument (4 ctors, 11 properties, ~40 methods)

| C# Member | TS member | Convertible? | Notes |
|---|---|---|---|
| `XDocument()` | `new XDocument()` | yes | |
| `XDocument(Object[])` | `new XDocument(...content)` | yes | |
| `XDocument(XDeclaration, Object[])` | `new XDocument(decl, ...content)` | yes | |
| `XDocument(XDocument)` | copy ctor | yes | |
| `Declaration` (get/set) | `.declaration` (readonly in TS — see Table 2) | partial | |
| `DocumentType` | — | **no** | |
| `Root` | `.root` | yes | |
| `Load(String)` / `(String, LoadOptions)` | `XDocument.load(path)` / `loadAsync(path)` | yes | |
| `Load(Stream)` / `(TextReader)` / `(XmlReader)` (+ async) | — | **no** | |
| `Parse(String)` / `(String, LoadOptions)` | `XDocument.parse(xml)` | yes | |
| `Save(...)` overloads | — | partial (file path only if supported) | |
| `WriteTo(XmlWriter)` / `WriteToAsync` | — | **no** | |
| All inherited members | see B.4 / B.5 / B.6 | | |

#### B.9 — XName (3 properties, 4 methods, 3 operators)

| C# Member | TS member | Convertible? |
|---|---|---|
| `LocalName` | `.localName` | yes |
| `Namespace` | `.namespace` | yes |
| `NamespaceName` | `.namespaceName` | yes |
| `Get(String)` (Clark notation) | `XName.get(name)` | yes |
| `Get(String, String)` (localName, ns) | `XName.get(ns, localName)` | yes — note argument order swap |
| `ToString()` | `.toString()` | yes |
| `Equality(==)` / `Inequality(!=)` | `a.equals(b)` / `!a.equals(b)` | partial — operators not portable, but semantics yes |
| `Implicit(String → XName)` | most APIs accept `XName \| string`; explicit `XName.get(...)` otherwise | yes — port as direct call |
| `IEquatable<XName>.Equals(XName)` | `.equals(other)` | yes |

#### B.10 — XNamespace (4 properties, 4 methods, 4 operators)

| C# Member | TS member | Convertible? |
|---|---|---|
| `NamespaceName` | `.namespaceName` | yes |
| `None` (static) | `XNamespace.none` | yes |
| `Xml` (static) | `XNamespace.xml` | yes |
| `Xmlns` (static) | `XNamespace.xmlns` | yes |
| `Get(String)` | `XNamespace.get(uri)` | yes |
| `GetName(String)` | `.getName(localName)` | yes |
| `ToString()` | `.toString()` | yes |
| `Addition(XNamespace, String)` (ns + "local") | `ns + 'local'` via string concat (TS exploits + on objects via toString) | yes — works in TS due to XNamespace.toString returning `{uri}` |
| `Equality(==)` / `Inequality(!=)` | `.equals(other)` | yes |
| `Implicit(String → XNamespace)` | `XNamespace.get(uri)` | yes |

#### B.11 — Extensions (18 methods)

The TS port exposes these both as standalone functions in `ltxmlts` and as `XSequence` methods.

| C# Extension | TS equivalent | Convertible? |
|---|---|---|
| `Ancestors<T>(IEnumerable<T>)` / `(…, XName)` | `ancestors(nodes)` / `ancestors(nodes, name)` or `xseq(...).ancestors()` | yes |
| `AncestorsAndSelf(...)` / `(..., XName)` | `ancestorsAndSelf(elems)` / `ancestorsAndSelf(elems, name)` | yes |
| `Attributes(IEnumerable<XElement>)` / `(..., XName)` | `attributes(elems)` / `attributes(elems, name)` | yes |
| `DescendantNodes(...)` | `descendantNodes(elems)` | yes |
| `DescendantNodesAndSelf(...)` | — | partial — check TS port for equivalent |
| `Descendants<T>(...)` / `(..., XName)` | `descendants(elems)` / `descendants(elems, name)` | yes |
| `DescendantsAndSelf(...)` / `(..., XName)` | `descendantsAndSelf(elems)` / `descendantsAndSelf(elems, name)` | yes |
| `Elements<T>(...)` / `(..., XName)` | `elements(nodes)` / `elements(nodes, name)` | yes |
| `InDocumentOrder<T>(...)` | `inDocumentOrder(items)` | yes |
| `Nodes<T>(...)` | `nodes(elems)` | yes |
| `Remove(IEnumerable<XAttribute>)` / `Remove<T>(...)` | `remove(items)` | yes |

### C. Conceptual / "How to" articles (98 source files, URL pattern `https://learn.microsoft.com/en-us/dotnet/standard/linq/<slug>`)

Each article has ≥1 C# example with output. The list of slugs below is canonical from `dotnet/docs/docs/standard/linq/`.

**Construction & loading** (12 articles)  
`functional-construction` · `create-xml-trees` · `load-xml-file` · `parse-string` · `populate-xml-tree-file-system` · `populate-xml-tree-xmlwriter` · `create-tree-xmlreader` · `stream-xml-fragments-xmlreader` · `read-write-encoded-document` · `preserve-white-space-loading-parsing-xml` · `preserve-white-space-serializing` · `catch-parsing-errors`

**Modification** (3 articles)  
`add-elements-attributes-nodes-xml-tree` · `modify-elements-attributes-nodes-xml-tree` · `in-memory-xml-tree-modification-vs-functional-construction`

**Queries / axes** (38 articles)  
`basic-queries-linq-to-xml` · `query-xml-trees-overview` · `query-xdocument-vs-query-xelement` · `query-linq-xml-xpath` · `linq-xml-axes-overview` · `language-integrated-axes` · `chain-axis-method-calls` · `chain-queries-example` · `chain-standard-query-operators-together` · `find-child-element` · `find-child-elements-based-position` · `find-descendant-elements` · `find-descendants-child-element` · `find-descendants-specific-element-name` · `find-element-specific-attribute` · `find-element-specific-child-element` · `find-elements-namespace` · `find-elements-specific-attribute` · `find-attribute-parent` · `find-attributes-siblings-specific-name` · `find-immediate-preceding-sibling` · `find-list-child-elements` · `find-preceding-siblings` · `find-related-elements` · `find-root-element` · `find-sibling-nodes` · `find-single-descendant-descendants-method` · `find-all-nodes-namespace` · `find-union-two-location-paths` · `filter-attribute` · `filter-element-names` · `filter-optional-element` · `list-all-nodes-tree` · `program-nodes` · `debug-empty-query-results-sets`

**Namespaces** (7 articles)  
`namespaces-overview` · `create-document-namespaces-csharp` · `create-document-namespaces-visual-basic` · `change-namespace-entire-xml-tree` · `control-namespace-prefixes` · `atomized-xname-xnamespace-objects` · `pre-atomization-xname-objects`

**Functional transformation** (15 articles)  
`introduction-pure-functional-transformations` · `concepts-terminology-functional-transformation` · `applicability-functional-transformation` · `functional-vs-imperative-programming` · `functional-vs-procedural-programming` · `refactor-pure-function` · `refactor-pure-functions` · `refactor-extension-method` · `functional-transformation-xml` · `mixed-declarative-imperative-code-bugs` · `deferred-execution-example` · `deferred-execution-lazy-evaluation` · `intermediate-materialization` · `calculate-intermediate-values` · `performance-chained-queries`

**Projection** (10 articles)  
`project-anonymous-type` · `project-new-type` · `project-object-graph` · `project-xml-different-shape` · `control-type-projection` · `create-hierarchy-grouping` · `generate-text-files-xml` · `generate-xml-csv-files` · `join-two-collections` · `maintain-name-value-pairs`

**Streaming** (2 articles, mostly NOT portable — use XmlReader)  
`perform-streaming-transform-large-xml-documents` · `perform-streaming-transformations-text-xml`

**Office Open XML** (5 articles)  
`create-source-office-open-xml-document` · `example-outputs-office-open-xml-document-parts` · `modify-office-open-xml-document` · `find-text-word-documents` · `find-default-paragraph-style`

**Overview / comparison / misc** (6 articles)  
`linq-xml-overview` · `linq-xml-classes-overview` · `linq-xml-vs-dom` · `linq-xml-vs-xml-technologies` · `comparison-xpath-linq-xml` · `linq-xml-annotations` · `linq-xml-events` · `linq-xml-security`

> Articles whose examples are explicitly about XmlReader / XmlWriter / XPath / XSD / XStreamingElement (`stream-xml-fragments-xmlreader`, `populate-xml-tree-xmlwriter`, `create-tree-xmlreader`, `query-linq-xml-xpath`, `perform-streaming-*`, `comparison-xpath-linq-xml`) are excluded by Table 2 even though listed here for inventory completeness.

---

## Table 2 — Non-convertible APIs / topics

Each row applies to every member page that depends on the listed API.

| C# API / Topic | Reason | TS port equivalent |
|---|---|---|
| `XStreamingElement` (entire class) | Class not implemented in port — deferred-streaming construction model | — |
| `XDocumentType` | Class not implemented; DTD support is out of scope | — |
| `XNodeDocumentOrderComparer`, `XNodeEqualityComparer` (and `XNode.DocumentOrderComparer` / `XNode.EqualityComparer` statics) | Comparer classes not implemented; semantics covered by `XNode.deepEquals` and `inDocumentOrder()` | use those |
| `XObjectChangeEventArgs`, `XObjectChange` enum, `XObject.Changed` / `Changing` events | Change-event infrastructure not implemented | — |
| `XObject.BaseUri` | Not implemented (no base-URI tracking on load) | — |
| `XNode.IsAfter` / `XNode.IsBefore` / `CompareDocumentOrder` | Static comparator API not implemented | rebuild from `inDocumentOrder()` ordering |
| `XmlReader` / `XmlWriter` overloads | `XmlReader`/`XmlWriter` are .NET-only; not in port. Affects: `XElement.Load(XmlReader)`, `XElement.Save(XmlWriter)`, `XElement.WriteTo`, `XDocument.Load(XmlReader)`, `XDocument.Save(XmlWriter)`, `XDocument.WriteTo`, `XNode.CreateReader`, `XContainer.CreateWriter`, `XNode.ReadFrom`, `XNode.WriteTo`, `IXmlSerializable.{GetSchema,ReadXml,WriteXml}`, and the conceptual articles `populate-xml-tree-xmlwriter`, `create-tree-xmlreader`, `stream-xml-fragments-xmlreader`, `perform-streaming-*` | Use `parse(string)` / `toString()` / file path overloads |
| `Stream` / `TextReader` / `TextWriter` overloads | TS port load/save accepts file paths or strings only. Affects `Load(Stream)`, `Load(TextReader)`, `Save(Stream)`, `Save(TextWriter)` and async variants | file path or `parse(string)` |
| `XPath` extensions (`XPathSelectElement`, `XPathSelectElements`, `XPathEvaluate`, `CreateNavigator`, `ToXPathNavigable`) — in `System.Xml.XPath.Extensions` | XPath not implemented in port; member pages listed for completeness but excluded from suite. Affects conceptual articles `query-linq-xml-xpath`, `comparison-xpath-linq-xml` | use array/XSequence queries |
| `XSD Validate` extensions (`Validate`, `GetSchemaInfo`) — in `System.Xml.Schema.Extensions` | XSD validation not implemented | — |
| `IXmlLineInfo` (explicit interface impls on XObject) | Line/column info not preserved across the port's parser yet (port has separate `XmlParseError` line/column only on errors) | use `XmlParseError` |
| C# `Explicit` cast operators (25 each on XAttribute and XElement) | TS has no operator overloading. **However**, each docs page's example can still be ported using `Number(attr.value)`, `Boolean(...)`, `new Date(...)`, etc., or by testing the equivalent string parse. Whether to include is policy: recommend including them but flagging "compat-by-substitution" in test comments. | substituted |
| C# implicit `string → XName` / `string → XNamespace` | TS APIs accept `XName \| string` directly OR via `XName.get(s)`. Tests use the direct form — not flagged. | direct form |
| LINQ query syntax (`from … where … select …`) | TS has no equivalent syntax. Translated mechanically into `.filter().map()` or XSequence. Not flagged as non-portable — pure translation. | translated |
| `XElement.Name` setter (element rename) | TS `name` is readonly | port the demo via "remove and re-add with new name" or skip with COMPAT note |
| `XDocument.Declaration` setter | TS `declaration` is readonly | construct a new XDocument with the new declaration |
| `XElement.GetDefaultNamespace` / `GetNamespaceOfPrefix` / `GetPrefixOfNamespace` | Confirm presence in TS port; if absent, mark partial. Examples involve namespace-scope lookup at runtime. | confirm during execution |
| `LoadOptions.SetBaseUri` / `SetLineInfo` flag values | Base URI / line info not tracked on load | use `PreserveWhitespace` only |
| `ReaderOptions` enum | XmlReader not in port | — |
| Examples using `File.ReadAllText`, `StreamWriter`, etc. | These are .NET BCL primitives not directly used by LtXmlTs tests; port to `node:fs` if a test needs to demonstrate file loading | use `node:fs` |

---

## Execution approach (after plan approval)

1. **Build the harness** (`tests/compat/_helpers.ts`, vitest config patch to add a `compat` project or test-include pattern). One-time setup.

2. **Drive in passes per class** — for each class in section B:
   - WebFetch the class overview page → if it has an example, generate `Compat-Test-<Class>-class-overview.test.ts`.
   - Enumerate member URLs from the overview's tables (already in this plan).
   - For each member URL in **parallel batches of 4 WebFetch calls**, detect example/output and emit one test if present, skip if not.
   - Commit per-class as a logical unit.

3. **Then conceptual articles** in the order listed in section C, batched 4 in parallel.

4. **Per-test exit criteria**: test compiles, runs, and passes. **Pages whose example depends on non-portable APIs (Table 2 reasons) produce no file at all** — they are simply absent from the suite. The only cases that get `it.skip(...)` are tests we *attempted* to port that fail because of a port-vs-.NET serialization divergence; those skips carry a one-line `// COMPAT:` note explaining the divergence. Never silently fudge the expected string.

5. **Cast-operator examples** (25 each on XAttribute / XElement) ARE included as **compat-by-substitution** tests. Each test ports the operator example by replacing the C# cast with `Number(...)` / `Boolean(...)` / `new Date(...)` / etc. and adds a `// COMPAT: substituted — TS has no operator overload, semantics tested via value coercion` comment.

6. **Project-level totals to track**: passing / skipped (with reasons grouped). No README produced for the compat suite unless requested.

### Critical files to be modified / created

- `tests/Compat-Test-_helpers.ts` — new (output capture + assertion utility).
- `tests/Compat-Test-*.test.ts` — many new files, flat in `tests/`. The existing `vitest.config.ts` already picks up `tests/**/*.test.ts`, so no config change required. `package.json` optionally gets a `test:compat` script: `"test:compat": "vitest run tests/Compat-Test-"`.

No source under `src/` is modified. If a port gap is uncovered during execution (e.g. an expected method is missing), the affected test is skipped with a `// COMPAT:` note describing what's missing — **the compat suite reveals gaps, it does not fix them**. Members that are wholly non-portable per Table 2 produce no file at all.

---

## Verification

- `npm run build` — type-check passes.
- `npm test` — full suite (existing + compat) passes; compat suite has zero unexplained failures.
- `npx vitest run tests/compat` — compat-only run summarizes pass/skip counts.
- For each skipped test, the `// COMPAT:` comment cites the specific reason from Table 2.
- After a complete pass, the proportion of skipped vs passing tests is the headline compatibility metric.

---

## Decisions (confirmed)

- Tests live **flat in `tests/`** with `Compat-Test-` filename prefix (not a separate directory).
- Non-portable members (anything in Table 2) **produce no file** — they are absent from the suite, not skipped placeholders.
- Cast-operator examples **are included** as compat-by-substitution tests using JS coercion (`Number(...)`, `new Date(...)`, etc.) with a `// COMPAT: substituted` marker.
