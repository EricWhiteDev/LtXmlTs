import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ShadingType, AlignmentType, BorderStyle,
} from 'docx';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, '..', 'docs');

// ─── Palette & constants ─────────────────────────────────────────────────────
const BLUE       = '2E74B5';
const LIGHT_BLUE = 'DEEAF1';
const CODE_BG    = 'F2F2F2';
const DARK       = '2F2F2F';
const MID        = '595959';
const WHITE      = 'FFFFFF';
const BODY       = 'Calibri';
const MONO       = 'Consolas';

// ─── Block helpers ────────────────────────────────────────────────────────────
const gap = () => new Paragraph({ text: '', spacing: { after: 60 } });

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 40, font: BODY, color: BLUE })],
    spacing: { before: 0, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
  });
}

function body(runs) {
  return new Paragraph({
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: r.bold ?? false,
      italics: r.italic ?? false,
      font: r.code ? MONO : BODY,
      size: r.code ? 18 : 20,
      color: r.code ? '7B3F00' : DARK,
    })),
    spacing: { after: 80 },
  });
}

const plain = text => body([{ text }]);

function label(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 20, font: BODY, color: DARK })],
    spacing: { before: 100, after: 40 },
  });
}

function note(text) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: 'FFF9E6' },
    children: [new TextRun({ text: '⚑  ' + text, size: 18, font: BODY, color: '7B5700', italics: true })],
    indent: { left: 360 },
    spacing: { before: 60, after: 60 },
  });
}

function badge(text, fill, color = WHITE) {
  return new TextRun({ text: ` ${text} `, bold: true, size: 16, font: BODY, color, shading: { type: ShadingType.CLEAR, fill } });
}

function memberHeading(name, kind) {
  const kindColor = {
    property:          '4472C4',
    getter:            '4472C4',
    'getter/setter':   '4472C4',
    method:            '375623',
    'static method':   '7030A0',
    'static property': '7030A0',
    constructor:       'C55A11',
  }[kind] ?? '404040';
  return new Paragraph({
    children: [
      new TextRun({ text: name, bold: true, size: 24, font: MONO, color: DARK }),
      new TextRun({ text: '  ' }),
      badge(kind, kindColor),
    ],
    spacing: { before: 200, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } },
  });
}

function sigLine(text) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: CODE_BG },
    children: [new TextRun({ text, font: MONO, size: 18, color: '1F3864' })],
    indent: { left: 360 },
    spacing: { before: 0, after: 0 },
  });
}

function paramsTable(rows) {
  if (!rows || rows.length === 0) return null;
  const headerRow = new TableRow({
    tableHeader: true,
    children: ['Parameter', 'Type', 'Description'].map((t, i) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: BLUE },
        width: { size: [22, 22, 56][i], type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({ text: t, bold: true, color: WHITE, size: 18, font: BODY })],
          alignment: AlignmentType.CENTER,
        })],
      })
    ),
  });
  const dataRows = rows.map(([p, t, d], i) =>
    new TableRow({
      children: [p, t, d].map(cell =>
        new TableCell({
          shading: i % 2 === 1 ? { type: ShadingType.CLEAR, fill: LIGHT_BLUE } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: cell, font: MONO, size: 18, color: DARK })] })],
        })
      ),
    })
  );
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] });
}

function codeLines(lines) {
  return lines.map((line, i) => new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: CODE_BG },
    children: [new TextRun({ text: line, font: MONO, size: 18, color: '1F3864' })],
    indent: { left: 360 },
    spacing: { before: 0, after: i === lines.length - 1 ? 80 : 0 },
  }));
}

function inheritanceLine(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: 'Inheritance: ', bold: true, size: 18, font: BODY, color: MID }),
      new TextRun({ text, size: 18, font: MONO, color: DARK }),
    ],
    spacing: { after: 120 },
  });
}

// ─── Member builder ───────────────────────────────────────────────────────────
function member({ name, kind, sigs, params, returns, semantics, example, description }) {
  const blocks = [memberHeading(name, kind)];
  if (Array.isArray(description)) description.forEach(d => blocks.push(plain(d)));
  else blocks.push(plain(description));

  if (sigs && sigs.length > 0) {
    blocks.push(label('Signature'));
    sigs.forEach(s => blocks.push(sigLine(s)));
    blocks.push(gap());
  }

  const pt = paramsTable(params);
  if (pt) { blocks.push(label('Parameters')); blocks.push(pt); blocks.push(gap()); }

  if (returns) {
    blocks.push(label('Returns'));
    blocks.push(body([{ text: returns }]));
  }

  if (semantics) {
    blocks.push(label('Special Semantics'));
    if (Array.isArray(semantics)) semantics.forEach(s => blocks.push(note(s)));
    else blocks.push(note(semantics));
  }

  if (example && example.length > 0) {
    blocks.push(label('Example'));
    blocks.push(...codeLines(example));
  }

  return blocks;
}

// ─── Document factory ─────────────────────────────────────────────────────────
async function writeDoc(filename, classContent) {
  const doc = new Document({ sections: [{ children: classContent }] });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(DOCS_DIR, `${filename}.docx`), buf);
  console.log(`  wrote ${filename}.docx`);
}

// ════════════════════════════════════════════════════════════════════════════
// CLASS DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════

// ─── XObject ─────────────────────────────────────────────────────────────────
async function genXObject() {
  const content = [
    h1('XObject'),
    inheritanceLine('XObject'),
    plain('XObject is the abstract base class for every node and attribute in an LtXmlTs XML tree. It provides the annotation API for attaching arbitrary metadata to XML objects, and exposes the parent reference and the document accessor that are inherited by all derived types.'),
    plain('You will not instantiate XObject directly. Every class in the library — XNode, XElement, XAttribute, and so on — inherits from XObject.'),

    ...member({
      name: 'nodeType',
      kind: 'property',
      sigs: ['public nodeType: XmlNodeType'],
      description: 'Identifies the type of this XML object. The value is one of the string literals of the XmlNodeType union: "Element", "Text", "Comment", "CDATA", "ProcessingInstruction", "Attribute", "Document", or null for the base class before initialization.',
      example: ["const el = new XElement('root');", "console.log(el.nodeType); // 'Element'"],
    }),

    ...member({
      name: 'parent',
      kind: 'property',
      sigs: ['public parent: XObject | null'],
      description: 'The parent of this object in the XML tree. For nodes this is the containing XElement or XDocument. For attributes this is the containing XElement. null when the object has no parent (it is detached or is the document root).',
      example: [
        "const child = new XElement('child');",
        "const parent = new XElement('parent', child);",
        "console.log(child.parent === parent); // true",
        "console.log(parent.parent);           // null",
      ],
    }),

    ...member({
      name: 'document',
      kind: 'getter',
      sigs: ['public get document(): XDocument | null'],
      description: 'Walks up the parent chain and returns the XDocument that contains this object, or null if the object is not attached to a document.',
      example: [
        "const doc = new XDocument(new XElement('root', new XElement('child')));",
        "const child = doc.root!.elements()[0];",
        "console.log(child.document === doc); // true",
        '',
        "const detached = new XElement('x');",
        "console.log(detached.document); // null",
      ],
    }),

    ...member({
      name: 'addAnnotation',
      kind: 'method',
      sigs: ['public addAnnotation(obj: any): void'],
      params: [['obj', 'any', 'Any value to attach to this object as an annotation.']],
      description: 'Attaches an arbitrary annotation object to this XML object. Multiple annotations of the same or different types can be added. Annotations are never serialized to XML.',
      example: [
        "class MyMeta { constructor(public tag: string) {} }",
        "const el = new XElement('item');",
        "el.addAnnotation(new MyMeta('important'));",
      ],
    }),

    ...member({
      name: 'annotation',
      kind: 'method',
      sigs: ['public annotation<T>(ctor: new (...args: any[]) => T): T | null'],
      params: [['ctor', 'Constructor<T>', 'The class whose first matching instance to find.']],
      returns: 'T | null — the first annotation that is an instance of ctor, or null.',
      description: 'Returns the first annotation whose type matches the given constructor, or null if none is found.',
      example: [
        "class MyMeta { constructor(public tag: string) {} }",
        "el.addAnnotation(new MyMeta('urgent'));",
        "const m = el.annotation(MyMeta);",
        "console.log(m?.tag); // 'urgent'",
      ],
    }),

    ...member({
      name: 'annotations',
      kind: 'method',
      sigs: ['public annotations<T>(ctor: new (...args: any[]) => T): T[]'],
      params: [['ctor', 'Constructor<T>', 'The class to filter by.']],
      returns: 'T[] — all annotations that are instances of ctor.',
      description: 'Returns all annotations whose type matches the given constructor.',
      example: [
        "class Tag { constructor(public name: string) {} }",
        "el.addAnnotation(new Tag('a'));",
        "el.addAnnotation(new Tag('b'));",
        "const tags = el.annotations(Tag); // [Tag('a'), Tag('b')]",
      ],
    }),

    ...member({
      name: 'removeAnnotations',
      kind: 'method',
      sigs: [
        'public removeAnnotations(): void',
        'public removeAnnotations<T>(ctor: new (...args: any[]) => T): void',
      ],
      params: [['ctor', 'Constructor<T>  (optional)', 'When provided, removes only annotations of this type. When omitted, removes all annotations.']],
      description: 'Removes annotations from this object. With no argument removes all annotations. With a constructor argument removes only annotations of that type.',
      example: [
        "el.removeAnnotations(Tag);  // removes only Tag annotations",
        "el.removeAnnotations();     // removes everything",
      ],
    }),
  ];
  await writeDoc('XObject', content);
}

// ─── XNode ───────────────────────────────────────────────────────────────────
async function genXNode() {
  const content = [
    h1('XNode'),
    inheritanceLine('XObject → XNode'),
    plain('XNode is the abstract base for all XML nodes: elements, text, comments, CDATA sections, and processing instructions. It adds sibling navigation, ancestor queries, parent-relative insertion and removal, and deep equality comparison.'),
    plain('You will not instantiate XNode directly.'),

    ...member({
      name: 'ancestors',
      kind: 'method',
      sigs: ['public ancestors(): XElement[]', 'public ancestors(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'When provided, only ancestors with this element name are returned.']],
      returns: 'XElement[] — ancestor elements nearest-first.',
      description: 'Returns an array of all ancestor XElement nodes of this node, starting with the immediate parent and walking up to the root. Stops at any non-element ancestor (such as an XDocument).',
      example: [
        "const xml = XElement.parse('<root><a><b/></a></root>');",
        "const b = xml.descendants('b')[0];",
        "b.ancestors();        // [<a>, <root>]",
        "b.ancestors('root');  // [<root>]",
      ],
    }),

    ...member({
      name: 'elementsAfterSelf',
      kind: 'method',
      sigs: ['public elementsAfterSelf(): XElement[]', 'public elementsAfterSelf(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XElement[] — sibling elements that follow this node.',
      description: 'Returns all sibling XElement nodes that appear after this node in the parent\'s child list.',
      example: [
        "const parent = new XElement('p', new XElement('a'), new XElement('b'), new XElement('c'));",
        "const a = parent.elements()[0];",
        "a.elementsAfterSelf(); // [<b>, <c>]",
      ],
    }),

    ...member({
      name: 'elementsBeforeSelf',
      kind: 'method',
      sigs: ['public elementsBeforeSelf(): XElement[]', 'public elementsBeforeSelf(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XElement[] — sibling elements that precede this node.',
      description: 'Returns all sibling XElement nodes that appear before this node in the parent\'s child list.',
      example: [
        "const c = parent.elements()[2];",
        "c.elementsBeforeSelf(); // [<a>, <b>]",
      ],
    }),

    ...member({
      name: 'nodesAfterSelf',
      kind: 'method',
      sigs: ['public nodesAfterSelf(): XNode[]'],
      returns: 'XNode[] — all sibling nodes of any type that follow this node.',
      description: 'Returns all sibling nodes of any type that appear after this node, including text nodes, comments, and elements.',
      example: [
        "const el = new XElement('root', new XText('hi'), new XElement('a'), new XComment('c'));",
        "const text = el.nodes()[0];",
        "text.nodesAfterSelf(); // [<a>, <!-- c -->]",
      ],
    }),

    ...member({
      name: 'nodesBeforeSelf',
      kind: 'method',
      sigs: ['public nodesBeforeSelf(): XNode[]'],
      returns: 'XNode[] — all sibling nodes of any type that precede this node.',
      description: 'Returns all sibling nodes of any type that appear before this node.',
      example: [
        "const comment = el.nodes()[2];",
        "comment.nodesBeforeSelf(); // [XText('hi'), <a>]",
      ],
    }),

    ...member({
      name: 'previousNode',
      kind: 'getter',
      sigs: ['public get previousNode(): XNode | null'],
      returns: 'XNode | null — the immediately preceding sibling node, or null.',
      description: 'Returns the sibling node immediately before this node in the parent\'s child list, or null if this node is the first child or has no parent.',
      example: [
        "const b = parent.elements()[1];",
        "b.previousNode; // <a>",
      ],
    }),

    ...member({
      name: 'nextNode',
      kind: 'getter',
      sigs: ['public get nextNode(): XNode | null'],
      returns: 'XNode | null — the immediately following sibling node, or null.',
      description: 'Returns the sibling node immediately after this node in the parent\'s child list, or null if this node is the last child or has no parent.',
      example: [
        "const b = parent.elements()[1];",
        "b.nextNode; // <c>",
      ],
    }),

    ...member({
      name: 'addAfterSelf',
      kind: 'method',
      sigs: ['public addAfterSelf(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'One or more nodes, strings, or arrays of content to insert after this node.']],
      description: 'Inserts new content immediately after this node in its parent\'s child list. Accepts the same content types as XContainer.add().',
      semantics: 'Throws "The parent is missing." if the node has no parent.',
      example: [
        "const a = parent.elements('a')[0];",
        "a.addAfterSelf(new XElement('x'), new XElement('y'));",
        "// parent children: [<a>, <x>, <y>, ...]",
      ],
    }),

    ...member({
      name: 'addBeforeSelf',
      kind: 'method',
      sigs: ['public addBeforeSelf(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'Content to insert before this node.']],
      description: 'Inserts new content immediately before this node in its parent\'s child list.',
      semantics: 'Throws "The parent is missing." if the node has no parent.',
      example: [
        "b.addBeforeSelf(new XElement('x'));",
        "// parent children: [<a>, <x>, <b>, <c>]",
      ],
    }),

    ...member({
      name: 'replaceWith',
      kind: 'method',
      sigs: ['public replaceWith(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'Content to substitute for this node.']],
      description: 'Removes this node from its parent and inserts the given content in its place.',
      semantics: 'Throws "The parent is missing." if the node has no parent.',
      example: [
        "b.replaceWith(new XElement('newB'), new XElement('extra'));",
      ],
    }),

    ...member({
      name: 'remove',
      kind: 'method',
      sigs: ['public remove(): void'],
      description: 'Removes this node from its parent container and sets parent to null.',
      semantics: 'Throws "The parent is missing." if the node has no parent.',
      example: [
        "const item = xml.descendants('item')[0];",
        "item.remove();",
        "console.log(item.parent); // null",
      ],
    }),

    ...member({
      name: 'deepEquals',
      kind: 'method',
      sigs: [
        'public deepEquals(other: XNode): boolean',
        'public static deepEquals(a: XNode, b: XNode): boolean',
      ],
      params: [
        ['other / a', 'XNode', 'Node to compare against.'],
        ['b', 'XNode', '(Static form) Second node.'],
      ],
      returns: 'boolean — true if the two nodes are structurally identical.',
      description: 'Performs a deep structural equality comparison. Two nodes are equal if they have the same type and the same content recursively. Dispatches to the type-specific equals() method of the concrete class.',
      example: [
        "const e1 = XElement.parse('<a x=\"1\"><b/></a>');",
        "const e2 = XElement.parse('<a x=\"1\"><b/></a>');",
        "XNode.deepEquals(e1, e2); // true",
        '',
        "const e3 = XElement.parse('<a x=\"2\"><b/></a>');",
        "XNode.deepEquals(e1, e3); // false (attribute differs)",
      ],
    }),
  ];
  await writeDoc('XNode', content);
}

// ─── XContainer ───────────────────────────────────────────────────────────────
async function genXContainer() {
  const content = [
    h1('XContainer'),
    inheritanceLine('XObject → XNode → XContainer'),
    plain('XContainer is the abstract base for XML nodes that can have child nodes: XElement and XDocument. It provides the complete API for accessing, adding, inserting, replacing, and removing child nodes, as well as querying for elements and descendants.'),
    plain('You will not instantiate XContainer directly.'),

    ...member({
      name: 'firstNode',
      kind: 'getter',
      sigs: ['public get firstNode(): XNode | null'],
      returns: 'XNode | null — the first child node, or null if empty.',
      description: 'Returns the first child node of this container.',
      example: ["const el = new XElement('root', new XText('hi'), new XElement('a'));", "el.firstNode; // XText('hi')"],
    }),

    ...member({
      name: 'lastNode',
      kind: 'getter',
      sigs: ['public get lastNode(): XNode | null'],
      returns: 'XNode | null — the last child node, or null if empty.',
      description: 'Returns the last child node of this container.',
      example: ["el.lastNode; // <a>"],
    }),

    ...member({
      name: 'nodes',
      kind: 'method',
      sigs: ['public nodes(): XNode[]'],
      returns: 'XNode[] — a shallow copy of all child nodes.',
      description: 'Returns a copy of the internal child node array. All node types are included. Modifying the returned array does not affect the container.',
      example: [
        "const el = new XElement('root', new XComment('c'), new XElement('a'));",
        "el.nodes(); // [XComment, XElement]",
      ],
    }),

    ...member({
      name: 'elements',
      kind: 'method',
      sigs: ['public elements(): XElement[]', 'public elements(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'When provided, only elements with this name are returned.']],
      returns: 'XElement[] — the child XElement nodes.',
      description: 'Returns only the direct child XElement nodes, optionally filtered by name.',
      example: [
        "const root = new XElement('root', new XElement('a'), new XText('x'), new XElement('b'));",
        "root.elements();      // [<a>, <b>]",
        "root.elements('a');   // [<a>]",
      ],
    }),

    ...member({
      name: 'element',
      kind: 'method',
      sigs: ['public element(name: XName | string): XElement | null'],
      params: [['name', 'XName | string', 'Element name to find.']],
      returns: 'XElement | null — the first matching child element, or null.',
      description: 'Returns the first direct child XElement with the given name, or null if not found.',
      example: [
        "const title = book.element('title');",
        "console.log(title?.value);",
      ],
    }),

    ...member({
      name: 'descendants',
      kind: 'method',
      sigs: ['public descendants(): XElement[]', 'public descendants(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XElement[] — all descendant elements in depth-first pre-order.',
      description: 'Returns all descendant XElement nodes at any depth below this container, in depth-first pre-order. The container itself is not included.',
      example: [
        "const xml = XElement.parse('<root><a><b/></a><c/></root>');",
        "xml.descendants();     // [<a>, <b>, <c>]",
        "xml.descendants('b');  // [<b>]",
      ],
    }),

    ...member({
      name: 'descendantNodes',
      kind: 'method',
      sigs: ['public descendantNodes(): XNode[]'],
      returns: 'XNode[] — all descendant nodes of any type in depth-first pre-order.',
      description: 'Returns all descendant nodes regardless of type — elements, text, comments, CDATA, processing instructions. The container itself is not included.',
      example: [
        "const xml = XElement.parse('<root>hello<a/><!-- note --></root>');",
        "xml.descendantNodes(); // [XText('hello'), <a/>, XComment(' note ')]",
      ],
    }),

    ...member({
      name: 'add',
      kind: 'method',
      sigs: ['public add(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'Nodes, strings, arrays, or other content to append.']],
      description: [
        'Appends content to the end of this container\'s child node list.',
        'Content rules: XElement and other XNode subclasses are added as child nodes. Strings are wrapped in XText. Arrays are recursively unpacked. XAttribute objects passed here are silently ignored (use the constructor or setAttributeValue instead). Objects are converted to string via toString() unless the result is "[object Object]".',
        'If a node already has a parent it is cloned before being added.',
      ],
      example: [
        "const root = new XElement('root');",
        "root.add(new XElement('a'), 'text', new XComment('c'));",
      ],
    }),

    ...member({
      name: 'addFirst',
      kind: 'method',
      sigs: ['public addFirst(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'Content to prepend.']],
      description: 'Prepends content to the beginning of this container\'s child list. The same content rules as add() apply.',
      example: [
        "root.addFirst(new XElement('header'));",
      ],
    }),

    ...member({
      name: 'replaceNodes',
      kind: 'method',
      sigs: ['public replaceNodes(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'New content to replace the existing child nodes.']],
      description: 'Removes all existing child nodes and replaces them with the given content.',
      example: [
        "root.replaceNodes(new XElement('new'));",
      ],
    }),

    ...member({
      name: 'removeNodes',
      kind: 'method',
      sigs: ['public removeNodes(): void'],
      description: 'Removes all child nodes from this container, leaving it empty.',
      example: ["root.removeNodes();", "console.log(root.nodes()); // []"],
    }),

    ...member({
      name: 'insertAfterChild',
      kind: 'method',
      sigs: ['public insertAfterChild(child: XNode, ...content: unknown[]): void'],
      params: [
        ['child', 'XNode', 'An existing child node used as the insertion reference point.'],
        ['content', 'unknown[]', 'Content to insert after child.'],
      ],
      description: 'Inserts content immediately after a specific existing child node.',
      example: [
        "const a = root.elements('a')[0];",
        "root.insertAfterChild(a, new XElement('x'));",
      ],
    }),

    ...member({
      name: 'insertBeforeChild',
      kind: 'method',
      sigs: ['public insertBeforeChild(child: XNode, ...content: unknown[]): void'],
      params: [
        ['child', 'XNode', 'An existing child node used as the reference point.'],
        ['content', 'unknown[]', 'Content to insert before child.'],
      ],
      description: 'Inserts content immediately before a specific existing child node.',
      example: [
        "root.insertBeforeChild(a, new XElement('x'));",
      ],
    }),

    ...member({
      name: 'replaceChild',
      kind: 'method',
      sigs: ['public replaceChild(child: XNode, ...content: unknown[]): void'],
      params: [
        ['child', 'XNode', 'The child node to replace.'],
        ['content', 'unknown[]', 'The replacement content.'],
      ],
      description: 'Removes a specific child node and inserts new content in its place.',
      example: [
        "root.replaceChild(a, new XElement('newA'));",
      ],
    }),

    ...member({
      name: 'removeChild',
      kind: 'method',
      sigs: ['public removeChild(child: XNode): void'],
      params: [['child', 'XNode', 'The child node to remove.']],
      description: 'Removes a specific child node from this container.',
      example: [
        "root.removeChild(root.elements('a')[0]);",
      ],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XContainer): boolean'],
      params: [['other', 'XContainer', 'The container to compare against.']],
      returns: 'boolean — true if both containers have identical child node sequences.',
      description: 'Performs a deep structural equality comparison of the child node lists. Called by XNode.deepEquals() and overridden by XElement and XDocument to include additional checks (name, attributes, declaration).',
      example: [
        "const a = new XElement('root', new XElement('child'));",
        "const b = new XElement('root', new XElement('child'));",
        "a.equals(b); // true",
      ],
    }),
  ];
  await writeDoc('XContainer', content);
}

// ─── XElement ─────────────────────────────────────────────────────────────────
async function genXElement() {
  const content = [
    h1('XElement'),
    inheritanceLine('XObject → XNode → XContainer → XElement'),
    plain('XElement is the primary class in LtXmlTs. It represents an XML element with a name, attributes, and child content. Most XML trees are built from, queried through, and serialized as XElement instances.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: [
        'new XElement(name: XName | string)',
        'new XElement(name: XName | string, ...content: unknown[])',
        'new XElement(other: XElement)',
      ],
      params: [
        ['name', 'XName | string', 'Element name, with optional namespace in Clark notation {uri}local.'],
        ['content', 'unknown[]', 'Initial child nodes, attributes, strings, and arrays of content.'],
        ['other', 'XElement', 'Source element to deep-copy (copy constructor).'],
      ],
      description: 'Creates a new XElement. Pass a name and optional content, or pass an existing XElement to clone it. When cloning, all attributes and child nodes are deep-copied.',
      example: [
        "// Simple",
        "const el = new XElement('item');",
        '',
        "// With content",
        "const el2 = new XElement('item',",
        "  new XAttribute('id', '1'),",
        "  new XElement('name', 'Widget'),",
        ");",
        '',
        "// Clone",
        "const copy = new XElement(el2);",
      ],
    }),

    ...member({
      name: 'name',
      kind: 'property',
      sigs: ['public readonly name: XName'],
      description: 'The fully-qualified name of this element, including namespace and local name.',
      example: [
        "const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
        "const el = new XElement(W + 'p');",
        "el.name.localName;   // 'p'",
        "el.name.namespaceName; // 'http://...'",
      ],
    }),

    ...member({
      name: 'value',
      kind: 'getter/setter',
      sigs: ['public get value(): string', 'public set value(value: string)'],
      description: [
        'Gets the concatenated text content of all descendant XText nodes. Setting the value removes all existing child nodes and replaces them with a single XText.',
      ],
      example: [
        "const el = new XElement('title', 'Hello ', new XElement('em', 'World'));",
        "el.value; // 'Hello World'",
        '',
        "el.value = 'New text';",
        "el.nodes(); // [XText('New text')]",
      ],
    }),

    ...member({
      name: 'hasElements',
      kind: 'getter',
      sigs: ['public get hasElements(): boolean'],
      returns: 'boolean — true if this element has at least one child XElement.',
      description: 'Returns true if this element contains at least one child element.',
      example: ["new XElement('a', new XElement('b')).hasElements; // true", "new XElement('a', 'text').hasElements;     // false"],
    }),

    ...member({
      name: 'isEmpty',
      kind: 'getter',
      sigs: ['public get isEmpty(): boolean'],
      returns: 'boolean — true if this element has no child nodes.',
      description: 'Returns true if this element has no child nodes at all (no text, no elements, no comments).',
      example: ["new XElement('a').isEmpty;              // true", "new XElement('a', 'x').isEmpty;         // false"],
    }),

    ...member({
      name: 'firstAttribute',
      kind: 'getter',
      sigs: ['public get firstAttribute(): XAttribute | null'],
      returns: 'XAttribute | null',
      description: 'Returns the first attribute of this element, or null if it has none.',
      example: ["const el = new XElement('a', new XAttribute('x', '1'), new XAttribute('y', '2'));", "el.firstAttribute?.name.localName; // 'x'"],
    }),

    ...member({
      name: 'lastAttribute',
      kind: 'getter',
      sigs: ['public get lastAttribute(): XAttribute | null'],
      returns: 'XAttribute | null',
      description: 'Returns the last attribute of this element, or null if it has none.',
      example: ["el.lastAttribute?.name.localName; // 'y'"],
    }),

    ...member({
      name: 'hasAttributes',
      kind: 'getter',
      sigs: ['public get hasAttributes(): boolean'],
      returns: 'boolean — true if this element has one or more attributes.',
      description: 'Returns true if this element has at least one attribute.',
      example: ["new XElement('a', new XAttribute('x', '1')).hasAttributes; // true"],
    }),

    ...member({
      name: 'attributes',
      kind: 'method',
      sigs: ['public attributes(): XAttribute[]', 'public attributes(name: XName | string): XAttribute[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XAttribute[]',
      description: 'Returns all attributes, or only those matching the given name.',
      example: [
        "el.attributes();        // [XAttribute('x','1'), XAttribute('y','2')]",
        "el.attributes('x');     // [XAttribute('x','1')]",
      ],
    }),

    ...member({
      name: 'attribute',
      kind: 'method',
      sigs: ['public attribute(name: XName | string): XAttribute | null'],
      params: [['name', 'XName | string', 'Attribute name.']],
      returns: 'XAttribute | null — the first matching attribute, or null.',
      description: 'Returns the first attribute with the given name, or null.',
      example: ["const id = el.attribute('id')?.value;"],
    }),

    ...member({
      name: 'setAttributeValue',
      kind: 'method',
      sigs: ['public setAttributeValue(name: XName | string, value: string | null): void'],
      params: [
        ['name', 'XName | string', 'The attribute name.'],
        ['value', 'string | null', 'New value, or null to remove the attribute.'],
      ],
      description: 'Sets the value of an existing attribute, adds a new attribute, or removes an attribute when value is null.',
      example: [
        "el.setAttributeValue('id', '42');   // add or update",
        "el.setAttributeValue('id', null);   // remove",
      ],
    }),

    ...member({
      name: 'setElementValue',
      kind: 'method',
      sigs: ['public setElementValue(name: XName | string, value: string | null): void'],
      params: [
        ['name', 'XName | string', 'Child element name.'],
        ['value', 'string | null', 'Text content to set, or null to remove the child element.'],
      ],
      description: 'Sets the text content of a direct child element with the given name. If the child exists it is updated; if it does not exist it is created. Passing null removes the child element.',
      example: [
        "book.setElementValue('title', 'New Title');",
        "book.setElementValue('draft', null); // removes <draft>",
      ],
    }),

    ...member({
      name: 'removeAttributes',
      kind: 'method',
      sigs: ['public removeAttributes(): void'],
      description: 'Removes all attributes from this element.',
      example: ["el.removeAttributes();", "el.hasAttributes; // false"],
    }),

    ...member({
      name: 'replaceAttributes',
      kind: 'method',
      sigs: ['public replaceAttributes(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'New XAttribute objects or arrays of them.']],
      description: 'Removes all existing attributes and adds the given attributes.',
      example: ["el.replaceAttributes(new XAttribute('id', '1'), new XAttribute('class', 'main'));"],
    }),

    ...member({
      name: 'removeAll',
      kind: 'method',
      sigs: ['public removeAll(): void'],
      description: 'Removes all attributes and all child nodes from this element, leaving it completely empty.',
      example: ["el.removeAll();", "el.isEmpty;       // true", "el.hasAttributes; // false"],
    }),

    ...member({
      name: 'replaceAll',
      kind: 'method',
      sigs: ['public replaceAll(...content: unknown[]): void'],
      params: [['content', 'unknown[]', 'New attributes and child nodes.']],
      description: 'Removes all content (attributes and child nodes) and replaces with the given content.',
      example: ["el.replaceAll(new XAttribute('id', '2'), new XElement('child'));"],
    }),

    ...member({
      name: 'ancestorsAndSelf',
      kind: 'method',
      sigs: ['public ancestorsAndSelf(): XElement[]', 'public ancestorsAndSelf(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XElement[] — this element followed by its ancestors, nearest-first.',
      description: 'Returns this element and all of its ancestor elements, starting with self.',
      example: [
        "const b = xml.descendants('b')[0];",
        "b.ancestorsAndSelf(); // [<b>, <a>, <root>]",
      ],
    }),

    ...member({
      name: 'descendantsAndSelf',
      kind: 'method',
      sigs: ['public descendantsAndSelf(): XElement[]', 'public descendantsAndSelf(name: XName | string): XElement[]'],
      params: [['name', 'XName | string  (optional)', 'Name filter.']],
      returns: 'XElement[] — this element followed by all descendant elements.',
      description: 'Returns this element and all of its descendant elements in depth-first pre-order.',
      example: [
        "root.descendantsAndSelf(); // [<root>, <a>, <b>, <c>]",
      ],
    }),

    ...member({
      name: 'descendantNodesAndSelf',
      kind: 'method',
      sigs: ['public descendantNodesAndSelf(): XNode[]'],
      returns: 'XNode[] — this element and all descendant nodes of any type.',
      description: 'Returns this element followed by all descendant nodes of any type (elements, text, comments, etc.).',
      example: [
        "const xml = XElement.parse('<a>hello<b/><!-- c --></a>');",
        "xml.descendantNodesAndSelf(); // [<a>, XText('hello'), <b/>, XComment(' c ')]",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — compact XML serialization.',
      description: 'Serializes this element to a compact XML string. Namespace prefixes are computed automatically from xmlns attributes already present in the tree; any undeclared namespaces get auto-generated p0, p1, … prefixes.',
      example: [
        "const el = new XElement('{urn:foo}bar', new XAttribute('{urn:foo}x', '1'));",
        "el.toString();",
        "// <p0:bar xmlns:p0='urn:foo' p0:x='1' />",
      ],
    }),

    ...member({
      name: 'toStringWithIndentation',
      kind: 'method',
      sigs: ['public toStringWithIndentation(): string'],
      returns: 'string — indented XML serialization.',
      description: 'Serializes this element to an indented XML string. Mixed content (elements that contain both text and child elements) is not indented to preserve whitespace semantics.',
      example: [
        "const root = new XElement('root', new XElement('child', new XElement('leaf')));",
        "console.log(root.toStringWithIndentation());",
        "// <root>",
        "//   <child>",
        "//     <leaf />",
        "//   </child>",
        "// </root>",
      ],
    }),

    ...member({
      name: 'parse',
      kind: 'static method',
      sigs: ['public static parse(xml: string): XElement'],
      params: [['xml', 'string', 'A complete, well-formed XML string.']],
      returns: 'XElement — the root element of the parsed XML.',
      description: 'Parses an XML string and returns the root element. Throws XmlParseError on malformed input.',
      semantics: 'The input must be a complete, well-formed XML fragment with a single root element. To parse a full document with an XML declaration, use XDocument.parse().',
      example: [
        "const el = XElement.parse('<items><item id=\"1\"/><item id=\"2\"/></items>');",
        "el.elements('item').length; // 2",
      ],
    }),

    ...member({
      name: 'load',
      kind: 'static method',
      sigs: ['public static load(filePath: string): XElement'],
      params: [['filePath', 'string', 'Absolute or relative path to an XML file.']],
      returns: 'XElement — the root element of the parsed XML file.',
      description: "Reads an XML file synchronously and returns the root element. Throws XmlParseError on malformed input; the error's filePath field is set to the provided path.",
      example: [
        "const el = XElement.load('/path/to/data.xml');",
        "el.name.localName; // e.g. 'root'",
      ],
    }),

    ...member({
      name: 'loadAsync',
      kind: 'static method',
      sigs: ['public static async loadAsync(filePath: string): Promise<XElement>'],
      params: [['filePath', 'string', 'Absolute or relative path to an XML file.']],
      returns: 'Promise<XElement> — resolves to the root element of the parsed XML file.',
      description: "Reads an XML file asynchronously and returns the root element. Throws XmlParseError on malformed input; the error's filePath field is set to the provided path.",
      example: [
        "const el = await XElement.loadAsync('/path/to/data.xml');",
        "el.name.localName; // e.g. 'root'",
      ],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XElement): boolean'],
      params: [['other', 'XElement', 'The element to compare against.']],
      returns: 'boolean — true if name, attributes, and child nodes all match.',
      description: 'Performs a deep structural equality comparison, checking name, attributes (in order), and child node content recursively.',
      example: [
        "const a = XElement.parse('<item id=\"1\"><child/></item>');",
        "const b = XElement.parse('<item id=\"1\"><child/></item>');",
        "a.equals(b); // true",
      ],
    }),
  ];
  await writeDoc('XElement', content);
}

// ─── XDocument ────────────────────────────────────────────────────────────────
async function genXDocument() {
  const content = [
    h1('XDocument'),
    inheritanceLine('XObject → XNode → XContainer → XDocument'),
    plain('XDocument represents a complete XML document. It may contain an optional XML declaration, a single root XElement, any number of comments and processing instructions, and whitespace-only text nodes. It is used when you need to round-trip a full XML file, including the <?xml ... ?> prolog.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: [
        'new XDocument()',
        'new XDocument(declaration: XDeclaration)',
        'new XDocument(...content: unknown[])',
        'new XDocument(declaration: XDeclaration, ...content: unknown[])',
        'new XDocument(other: XDocument)',
      ],
      params: [
        ['declaration', 'XDeclaration', 'Optional XML declaration for the document.'],
        ['content', 'unknown[]', 'Child nodes: one XElement, comments, PIs, whitespace text.'],
        ['other', 'XDocument', 'Source document to deep-copy.'],
      ],
      description: 'Creates a new XDocument with optional declaration and content, or clones an existing document.',
      semantics: [
        'An XDocument may contain at most one XElement (the root).',
        'XAttribute and XCData are not valid content and will throw.',
        'Non-whitespace string content will throw.',
      ],
      example: [
        "const doc = new XDocument(",
        "  new XDeclaration('1.0', 'UTF-8', 'yes'),",
        "  new XElement('root', new XElement('child')),",
        ");",
        "doc.toString();",
        "// <?xml version='1.0' encoding='UTF-8' standalone='yes'?><root><child /></root>",
      ],
    }),

    ...member({
      name: 'declaration',
      kind: 'property',
      sigs: ['public readonly declaration: XDeclaration | null'],
      description: 'The XML declaration for this document, or null if none was provided.',
      example: ["doc.declaration?.version; // '1.0'"],
    }),

    ...member({
      name: 'root',
      kind: 'getter',
      sigs: ['public get root(): XElement | null'],
      returns: 'XElement | null — the single root element, or null.',
      description: 'Returns the single XElement child of this document, or null if no root element has been added.',
      example: ["const root = doc.root;", "root?.name.localName; // 'root'"],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — compact serialization of the full document.',
      description: 'Serializes the entire document to a compact XML string, beginning with the declaration if present.',
      example: [
        "doc.toString();",
        "// <?xml version='1.0' encoding='UTF-8' standalone='yes'?><root><child /></root>",
      ],
    }),

    ...member({
      name: 'toStringWithIndentation',
      kind: 'method',
      sigs: ['public toStringWithIndentation(): string'],
      returns: 'string — indented serialization of the full document.',
      description: 'Serializes the entire document to an indented XML string.',
      example: [
        "console.log(doc.toStringWithIndentation());",
        "// <?xml version='1.0' encoding='UTF-8' standalone='yes'?>",
        "// <root>",
        "//   <child />",
        "// </root>",
      ],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XDocument): boolean'],
      params: [['other', 'XDocument', 'The document to compare.']],
      returns: 'boolean — true if declarations and child nodes both match.',
      description: 'Deep equality comparison. Checks that declarations are equal and all child nodes are structurally identical.',
      example: [
        "const d1 = XDocument.parse(\"<?xml version='1.0'?><root/>\");",
        "const d2 = XDocument.parse(\"<?xml version='1.0'?><root/>\");",
        "d1.equals(d2); // true",
      ],
    }),

    ...member({
      name: 'parse',
      kind: 'static method',
      sigs: ['public static parse(xml: string): XDocument'],
      params: [['xml', 'string', 'A complete, well-formed XML document string.']],
      returns: 'XDocument — the parsed document.',
      description: 'Parses a full XML document string, including an optional XML declaration, and returns an XDocument. Throws XmlParseError on malformed input.',
      example: [
        "const doc = XDocument.parse(",
        "  \"<?xml version='1.0' encoding='UTF-8' standalone='yes'?><root/>\",",
        ");",
        "doc.declaration?.encoding; // 'UTF-8'",
        "doc.root?.name.localName;  // 'root'",
      ],
    }),

    ...member({
      name: 'load',
      kind: 'static method',
      sigs: ['public static load(filePath: string): XDocument'],
      params: [['filePath', 'string', 'Absolute or relative path to an XML file.']],
      returns: 'XDocument — the parsed document.',
      description: "Reads an XML file synchronously and returns an XDocument, including any XML declaration. Throws XmlParseError on malformed input; the error's filePath field is set to the provided path.",
      example: [
        "const doc = XDocument.load('/path/to/doc.xml');",
        "doc.declaration?.encoding; // e.g. 'utf-8'",
        "doc.root?.name.localName;  // e.g. 'root'",
      ],
    }),

    ...member({
      name: 'loadAsync',
      kind: 'static method',
      sigs: ['public static async loadAsync(filePath: string): Promise<XDocument>'],
      params: [['filePath', 'string', 'Absolute or relative path to an XML file.']],
      returns: 'Promise<XDocument> — resolves to the parsed document.',
      description: "Reads an XML file asynchronously and returns an XDocument, including any XML declaration. Throws XmlParseError on malformed input; the error's filePath field is set to the provided path.",
      example: [
        "const doc = await XDocument.loadAsync('/path/to/doc.xml');",
        "doc.declaration?.version; // '1.0'",
      ],
    }),
  ];
  await writeDoc('XDocument', content);
}

// ─── XAttribute ───────────────────────────────────────────────────────────────
async function genXAttribute() {
  const content = [
    h1('XAttribute'),
    inheritanceLine('XObject → XAttribute'),
    plain('XAttribute represents an XML attribute on an element. Attributes are not nodes in the XNode sense — they do not appear in nodes() or descendants() results — but they inherit from XObject and carry the same parent reference and annotation API.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: [
        'new XAttribute(name: XName | string)',
        'new XAttribute(name: XName | string, content: unknown)',
        'new XAttribute(other: XAttribute)',
      ],
      params: [
        ['name', 'XName | string', 'Attribute name. Supports Clark notation {uri}local.'],
        ['content', 'unknown', 'Attribute value. Converted to string via toString(). May not be null or undefined.'],
        ['other', 'XAttribute', 'Source attribute to copy.'],
      ],
      description: 'Creates a new XAttribute. Pass name and optional value, or copy an existing attribute.',
      semantics: 'Passing null or undefined as content throws. Namespace declaration attributes use the xmlns namespace.',
      example: [
        "const a = new XAttribute('id', '42');",
        "const ns = new XAttribute(XNamespace.xmlns + 'w',",
        "  'http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
      ],
    }),

    ...member({
      name: 'name',
      kind: 'property',
      sigs: ['public readonly name: XName'],
      description: 'The fully-qualified name of this attribute.',
      example: ["attr.name.localName;       // 'id'", "attr.name.namespaceName;   // ''"],
    }),

    ...member({
      name: 'value',
      kind: 'property',
      sigs: ['public value: string'],
      description: 'The string value of this attribute. Can be set directly.',
      example: ["attr.value;         // '42'", "attr.value = '99';"],
    }),

    ...member({
      name: 'setValue',
      kind: 'method',
      sigs: ['public setValue(value: string): void'],
      params: [['value', 'string', 'The new value. Must not be null or undefined.']],
      description: 'Sets the attribute value. Throws if value is null or undefined.',
      example: ["attr.setValue('hello');"],
    }),

    ...member({
      name: 'isNamespaceDeclaration',
      kind: 'getter',
      sigs: ['public get isNamespaceDeclaration(): boolean'],
      returns: 'boolean — true if this is an xmlns or xmlns:prefix attribute.',
      description: 'Returns true when this attribute is a namespace declaration (its name is in the http://www.w3.org/2000/xmlns/ namespace).',
      example: [
        "new XAttribute('id', '1').isNamespaceDeclaration;                       // false",
        "new XAttribute(XNamespace.xmlns + 'w', 'urn:...').isNamespaceDeclaration; // true",
      ],
    }),

    ...member({
      name: 'nextAttribute',
      kind: 'getter',
      sigs: ['public get nextAttribute(): XAttribute | null'],
      returns: 'XAttribute | null — the next attribute on the same element, or null.',
      description: 'Returns the attribute declared immediately after this one on the same element.',
      example: [
        "const el = new XElement('a', new XAttribute('x','1'), new XAttribute('y','2'));",
        "el.firstAttribute?.nextAttribute?.name.localName; // 'y'",
      ],
    }),

    ...member({
      name: 'previousAttribute',
      kind: 'getter',
      sigs: ['public get previousAttribute(): XAttribute | null'],
      returns: 'XAttribute | null — the previous attribute on the same element, or null.',
      description: 'Returns the attribute declared immediately before this one on the same element.',
      example: ["el.lastAttribute?.previousAttribute?.name.localName; // 'x'"],
    }),

    ...member({
      name: 'remove',
      kind: 'method',
      sigs: ['public remove(): void'],
      description: 'Removes this attribute from its parent element and sets parent to null.',
      semantics: 'Throws "The parent is missing." if the attribute has no parent.',
      example: ["el.attribute('id')?.remove();"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XAttribute): boolean'],
      params: [['other', 'XAttribute', 'Attribute to compare.']],
      returns: 'boolean — true if name and value both match.',
      description: 'Returns true if this attribute has the same name (as Clark notation string) and the same value as other.',
      example: [
        "new XAttribute('id', '1').equals(new XAttribute('id', '1')); // true",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — the attribute serialized as name=\'value\'.',
      description: 'Serializes this attribute to a name=\'value\' string. Namespace prefixes are resolved from the parent element tree.',
      example: [
        "new XAttribute('id', 'hello & world').toString();",
        "// id='hello &amp; world'",
      ],
    }),
  ];
  await writeDoc('XAttribute', content);
}

// ─── XText ────────────────────────────────────────────────────────────────────
async function genXText() {
  const content = [
    h1('XText'),
    inheritanceLine('XObject → XNode → XText'),
    plain('XText represents a text node inside an XML element. Text content is automatically XML-escaped on serialization.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new XText(value: string)', 'new XText(other: XText)'],
      params: [
        ['value', 'string', 'The text content.'],
        ['other', 'XText', 'Source node to copy.'],
      ],
      description: 'Creates an XText node with the given string value, or copies another XText node.',
      example: ["const t = new XText('Hello & World');"],
    }),

    ...member({
      name: 'value',
      kind: 'property',
      sigs: ['public readonly value: string'],
      description: 'The raw text content. Not XML-escaped — the escaping happens at serialization time.',
      example: ["t.value; // 'Hello & World'"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XText): boolean'],
      returns: 'boolean',
      description: 'Returns true if both text nodes have the same value.',
      example: ["new XText('a').equals(new XText('a')); // true"],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — XML-escaped text.',
      description: 'Returns the text with &, <, and > escaped for XML.',
      example: ["new XText('a < b & c > d').toString(); // 'a &lt; b &amp; c &gt; d'"],
    }),
  ];
  await writeDoc('XText', content);
}

// ─── XComment ─────────────────────────────────────────────────────────────────
async function genXComment() {
  const content = [
    h1('XComment'),
    inheritanceLine('XObject → XNode → XComment'),
    plain('XComment represents an XML comment node (<!-- ... -->).'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new XComment(content: string)', 'new XComment(other: XComment)'],
      params: [
        ['content', 'string', 'Comment text. Must not contain --.'],
        ['other', 'XComment', 'Source node to copy.'],
      ],
      description: 'Creates an XComment node.',
      semantics: 'Throws if content contains "--", because "--" is not allowed inside XML comments.',
      example: [
        "const c = new XComment(' this is a comment ');",
        "c.toString(); // <!-- this is a comment -->",
      ],
    }),

    ...member({
      name: 'value',
      kind: 'property',
      sigs: ['public readonly value: string'],
      description: 'The raw comment text, without the <!-- --> delimiters.',
      example: ["c.value; // ' this is a comment '"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XComment): boolean'],
      returns: 'boolean',
      description: 'Returns true if both comments have the same value.',
      example: ["new XComment('a').equals(new XComment('a')); // true"],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string',
      description: 'Returns the comment as <!--value-->.',
      example: ["new XComment(' note ').toString(); // '<!-- note -->'"],
    }),
  ];
  await writeDoc('XComment', content);
}

// ─── XCData ───────────────────────────────────────────────────────────────────
async function genXCData() {
  const content = [
    h1('XCData'),
    inheritanceLine('XObject → XNode → XCData'),
    plain('XCData represents a CDATA section (<![CDATA[ ... ]]>). CDATA sections allow including content that would otherwise need to be escaped, such as HTML markup or code snippets.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new XCData(value: string)', 'new XCData(other: XCData)'],
      params: [
        ['value', 'string', 'CDATA content. Must not contain ]]>.'],
        ['other', 'XCData', 'Source node to copy.'],
      ],
      description: 'Creates an XCData node.',
      semantics: 'Throws if value contains "]]>" because that sequence terminates a CDATA section.',
      example: [
        "const cd = new XCData('<b>bold text & more</b>');",
        "cd.toString(); // <![CDATA[<b>bold text & more</b>]]>",
      ],
    }),

    ...member({
      name: 'value',
      kind: 'property',
      sigs: ['public readonly value: string'],
      description: 'The raw content of the CDATA section, without the <![CDATA[ ]]> delimiters.',
      example: ["cd.value; // '<b>bold text & more</b>'"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XCData): boolean'],
      returns: 'boolean',
      description: 'Returns true if both CDATA nodes have the same value.',
      example: ["new XCData('x').equals(new XCData('x')); // true"],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string',
      description: 'Returns the CDATA section as <![CDATA[value]]>.',
      example: ["new XCData('<em>hi</em>').toString(); // '<![CDATA[<em>hi</em>]]>'"],
    }),
  ];
  await writeDoc('XCData', content);
}

// ─── XProcessingInstruction ───────────────────────────────────────────────────
async function genXProcessingInstruction() {
  const content = [
    h1('XProcessingInstruction'),
    inheritanceLine('XObject → XNode → XProcessingInstruction'),
    plain('XProcessingInstruction represents an XML processing instruction (<?target data?>). Processing instructions carry application-specific instructions within XML documents.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new XProcessingInstruction(target: string, data: string)', 'new XProcessingInstruction(other: XProcessingInstruction)'],
      params: [
        ['target', 'string', 'The PI target name. Must not contain whitespace or ?>.'],
        ['data', 'string', 'The PI data string. Must not contain ?>.'],
        ['other', 'XProcessingInstruction', 'Source node to copy.'],
      ],
      description: 'Creates a processing instruction node.',
      semantics: [
        'Throws if target contains whitespace.',
        'Throws if target or data contains "?>".',
      ],
      example: [
        "const pi = new XProcessingInstruction('xml-stylesheet', 'type=\"text/css\" href=\"style.css\"');",
        "pi.toString(); // <?xml-stylesheet type=\"text/css\" href=\"style.css\"?>",
      ],
    }),

    ...member({
      name: 'target',
      kind: 'property',
      sigs: ['public readonly target: string'],
      description: 'The processing instruction target name.',
      example: ["pi.target; // 'xml-stylesheet'"],
    }),

    ...member({
      name: 'data',
      kind: 'property',
      sigs: ['public readonly data: string'],
      description: 'The processing instruction data string.',
      example: ["pi.data; // 'type=\"text/css\" href=\"style.css\"'"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XProcessingInstruction): boolean'],
      returns: 'boolean',
      description: 'Returns true if both PIs have the same target and data.',
      example: [
        "const a = new XProcessingInstruction('t', 'd');",
        "const b = new XProcessingInstruction('t', 'd');",
        "a.equals(b); // true",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string',
      description: 'Returns the PI as <?target data?>, or <?target?> if data is empty.',
      example: [
        "new XProcessingInstruction('target', 'data').toString(); // '<?target data?>'",
        "new XProcessingInstruction('target', '').toString();     // '<?target?>'",
      ],
    }),
  ];
  await writeDoc('XProcessingInstruction', content);
}

// ─── XDeclaration ─────────────────────────────────────────────────────────────
async function genXDeclaration() {
  const content = [
    h1('XDeclaration'),
    plain('XDeclaration represents the XML declaration that appears at the top of an XML document: <?xml version=\'1.0\' encoding=\'UTF-8\' standalone=\'yes\'?>. It is not a node and is not part of the node tree — it is held directly by XDocument.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: [
        "new XDeclaration(version: string, encoding: string, standalone: string)",
        "new XDeclaration(other: XDeclaration)",
      ],
      params: [
        ['version', 'string', 'XML version, typically "1.0".'],
        ['encoding', 'string', 'Character encoding, e.g. "UTF-8". Pass empty string to omit.'],
        ['standalone', 'string', '"yes" or "no". Pass empty string to omit.'],
        ['other', 'XDeclaration', 'Source to copy.'],
      ],
      description: 'Creates an XML declaration.',
      example: [
        "const decl = new XDeclaration('1.0', 'UTF-8', 'yes');",
        "decl.toString(); // <?xml version='1.0' encoding='UTF-8' standalone='yes'?>",
        '',
        "new XDeclaration('1.0', '', '').toString(); // <?xml version='1.0'?>",
      ],
    }),

    ...member({
      name: 'version',
      kind: 'property',
      sigs: ['public readonly version: string'],
      description: 'The XML version string.',
      example: ["decl.version; // '1.0'"],
    }),

    ...member({
      name: 'encoding',
      kind: 'property',
      sigs: ['public readonly encoding: string'],
      description: 'The encoding string, or empty string if not specified.',
      example: ["decl.encoding; // 'UTF-8'"],
    }),

    ...member({
      name: 'standalone',
      kind: 'property',
      sigs: ['public readonly standalone: string'],
      description: 'The standalone value ("yes", "no", or empty string).',
      example: ["decl.standalone; // 'yes'"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XDeclaration): boolean'],
      returns: 'boolean',
      description: 'Returns true if version, encoding, and standalone all match.',
      example: [
        "new XDeclaration('1.0','UTF-8','yes').equals(new XDeclaration('1.0','UTF-8','yes')); // true",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string',
      description: 'Serializes the declaration. Encoding and standalone attributes are omitted if their values are empty strings.',
      example: ["decl.toString(); // \"<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\""],
    }),
  ];
  await writeDoc('XDeclaration', content);
}

// ─── XName ────────────────────────────────────────────────────────────────────
async function genXName() {
  const content = [
    h1('XName'),
    plain('XName is an immutable, interned representation of an XML name. Every element and attribute carries an XName that captures both the namespace and the local name. XName instances are cached — two XName objects for the same namespace and local name are the same object (identity equality).'),

    ...member({
      name: 'constructor / XName.get',
      kind: 'static method',
      sigs: [
        'new XName(name: string)',
        'new XName(namespace: XNamespace, localName: string)',
        'static XName.get(name: string): XName',
        'static XName.get(namespace: XNamespace, localName: string): XName',
      ],
      params: [
        ['name', 'string', 'Local name, or Clark notation {uri}local.'],
        ['namespace', 'XNamespace', 'The namespace object.'],
        ['localName', 'string', 'The local part of the name.'],
      ],
      description: [
        'Creates or retrieves a cached XName. XName.get() is the preferred factory; the constructor also works and returns the cached instance.',
        'Clark notation: {http://example.com/ns}localName — the namespace URI is wrapped in braces followed immediately by the local name.',
      ],
      semantics: 'XName instances are cached. Calling new XName("foo") twice returns the same object.',
      example: [
        "const n1 = XName.get('title');",
        "const n2 = XName.get('title');",
        "n1 === n2; // true — same cached instance",
        '',
        "const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
        "const wParagraph = W.getName('p'); // preferred when namespace object is available",
        "// equivalent to:",
        "XName.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')",
      ],
    }),

    ...member({
      name: 'namespace',
      kind: 'property',
      sigs: ['public readonly namespace: XNamespace'],
      description: 'The XNamespace of this name. For unqualified names this is XNamespace.none (empty URI).',
      example: ["XName.get('foo').namespace === XNamespace.none; // true"],
    }),

    ...member({
      name: 'localName',
      kind: 'property',
      sigs: ['public readonly localName: string'],
      description: 'The local part of the name, without any namespace or prefix.',
      example: ["XName.get('{urn:example}item').localName; // 'item'"],
    }),

    ...member({
      name: 'namespaceName',
      kind: 'getter',
      sigs: ['public get namespaceName(): string'],
      returns: 'string — the namespace URI, or empty string for unqualified names.',
      description: 'Convenience accessor for the namespace URI string.',
      example: ["XName.get('{urn:example}item').namespaceName; // 'urn:example'"],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XName): boolean'],
      returns: 'boolean',
      description: 'Returns true if both names refer to the same cached instance (identity equality). Because XName is interned, this is equivalent to reference equality.',
      example: [
        "const a = XName.get('title');",
        "const b = XName.get('title');",
        "a.equals(b); // true (same object)",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — Clark notation, or plain local name if no namespace.',
      description: 'Returns the Clark notation string {uri}localName, or just localName if there is no namespace.',
      example: [
        "XName.get('foo').toString();                  // 'foo'",
        "XName.get('{urn:example}bar').toString();     // '{urn:example}bar'",
      ],
    }),
  ];
  await writeDoc('XName', content);
}

// ─── XNamespace ───────────────────────────────────────────────────────────────
async function genXNamespace() {
  const content = [
    h1('XNamespace'),
    plain('XNamespace represents an XML namespace URI. Like XName, XNamespace instances are cached — two XNamespace objects for the same URI are the same object. Three well-known namespaces are predefined as static constants.'),

    ...member({
      name: 'none',
      kind: 'static property',
      sigs: ['public static readonly none: XNamespace  // URI: ""'],
      description: 'The empty namespace. Used for elements and attributes with no namespace.',
      example: ["XNamespace.none.uri; // ''"],
    }),

    ...member({
      name: 'xml',
      kind: 'static property',
      sigs: ['public static readonly xml: XNamespace  // URI: http://www.w3.org/XML/1998/namespace'],
      description: 'The built-in XML namespace (prefix "xml"). Used for attributes like xml:space and xml:lang.',
      example: [
        "const xmlSpace = new XAttribute(XNamespace.xml + 'space', 'preserve');",
        "// xml:space='preserve'",
      ],
    }),

    ...member({
      name: 'xmlns',
      kind: 'static property',
      sigs: ['public static readonly xmlns: XNamespace  // URI: http://www.w3.org/2000/xmlns/'],
      description: 'The xmlns namespace. Used for namespace declaration attributes (xmlns and xmlns:prefix).',
      example: [
        "const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';",
        "const decl = new XAttribute(XNamespace.xmlns + 'w', W);",
        "// xmlns:w='http://...'",
      ],
    }),

    ...member({
      name: 'get',
      kind: 'static method',
      sigs: ['public static get(uri: string): XNamespace'],
      params: [['uri', 'string', 'The namespace URI.']],
      returns: 'XNamespace — cached instance for this URI.',
      description: 'Returns the cached XNamespace for the given URI. Preferred factory method.',
      example: [
        "const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
        "const el = new XElement(W.getName('document'));",
      ],
    }),

    ...member({
      name: 'uri',
      kind: 'property',
      sigs: ['public readonly uri: string'],
      description: 'The namespace URI string.',
      example: ["XNamespace.get('urn:example').uri; // 'urn:example'"],
    }),

    ...member({
      name: 'namespaceName',
      kind: 'getter',
      sigs: ['public get namespaceName(): string'],
      returns: 'string — same as uri.',
      description: 'Alias for uri, for compatibility with the XName.namespaceName pattern.',
      example: ["ns.namespaceName === ns.uri; // true"],
    }),

    ...member({
      name: 'preferredPrefix',
      kind: 'getter',
      sigs: ['public get preferredPrefix(): string | null'],
      returns: 'string | null — the preferred prefix, or null.',
      description: 'Returns the preferred namespace prefix if one has been registered for this URI. For XNamespace.xml this is "xml", for XNamespace.xmlns it is "xmlns".',
      example: ["XNamespace.xml.preferredPrefix;  // 'xml'", "XNamespace.xmlns.preferredPrefix; // 'xmlns'"],
    }),

    ...member({
      name: 'getName',
      kind: 'method',
      sigs: ['public getName(localName: string): XName'],
      params: [['localName', 'string', 'The local name to combine with this namespace.']],
      returns: 'XName — the fully-qualified name.',
      description: 'Creates (or retrieves the cached) XName for this namespace combined with the given local name.',
      example: [
        "const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
        "const wBody = W.getName('body');",
        "// equivalent to new XName(W, 'body')",
      ],
    }),

    ...member({
      name: 'equals',
      kind: 'method',
      sigs: ['public equals(other: XNamespace): boolean'],
      returns: 'boolean — identity equality.',
      description: 'Returns true if both namespaces are the same cached instance.',
      example: [
        "const ns1 = XNamespace.get('urn:a');",
        "const ns2 = XNamespace.get('urn:a');",
        "ns1.equals(ns2); // true",
      ],
    }),

    ...member({
      name: 'toString',
      kind: 'method',
      sigs: ['public toString(): string'],
      returns: 'string — {uri} or empty string.',
      description: 'Returns the URI wrapped in braces ({uri}), or an empty string for the none namespace. This enables the Clark-notation pattern: XNamespace.get(uri) + "localName" evaluates to "{uri}localName" via string concatenation, which XName\'s string constructor then parses.',
      example: [
        "const W = XNamespace.get('urn:w');",
        "W.toString();    // '{urn:w}'",
        '',
        "// Clark-notation element name via string concatenation:",
        "const name = W + 'body'; // '{urn:w}body'",
        "const el = new XElement(name);",
      ],
    }),
  ];
  await writeDoc('XNamespace', content);
}

// ─── NamespacePrefixPair ──────────────────────────────────────────────────────
async function genNamespacePrefixPair() {
  const content = [
    h1('NamespacePrefixPair'),
    plain('NamespacePrefixPair is a simple data class that binds an XNamespace to its serialization prefix. It is used internally during XML serialization to track which prefix string has been assigned to each namespace URI in a given scope. You typically interact with this class only if you are inspecting or extending namespace resolution.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new NamespacePrefixPair(namespace: XNamespace, prefix: string)'],
      params: [
        ['namespace', 'XNamespace', 'The namespace to associate.'],
        ['prefix', 'string', 'The prefix string (e.g., "w", "r", "xml").'],
      ],
      description: 'Creates a binding between a namespace and a prefix.',
      example: [
        "const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');",
        "const pair = new NamespacePrefixPair(W, 'w');",
        "pair.namespace === W; // true",
        "pair.prefix;          // 'w'",
      ],
    }),

    ...member({
      name: 'namespace',
      kind: 'property',
      sigs: ['public readonly namespace: XNamespace'],
      description: 'The namespace this pair maps.',
      example: ["pair.namespace.uri; // 'http://...'"],
    }),

    ...member({
      name: 'prefix',
      kind: 'property',
      sigs: ['public prefix: string'],
      description: 'The prefix assigned to this namespace. Mutable — the serializer may rename it during conflict resolution.',
      example: ["pair.prefix; // 'w'"],
    }),
  ];
  await writeDoc('NamespacePrefixPair', content);
}

// ─── NamespacePrefixInfo ──────────────────────────────────────────────────────
async function genNamespacePrefixInfo() {
  const content = [
    h1('NamespacePrefixInfo'),
    plain('NamespacePrefixInfo holds the namespace prefix scope for a single element during serialization. It tracks the current default namespace and the set of prefix-to-namespace bindings in scope. When serializing, each element gets a NamespacePrefixInfo derived from its parent\'s info, with any new xmlns declarations added.'),
    plain('You interact with this class only if extending or inspecting the serialization pipeline.'),

    ...member({
      name: 'pHashCount',
      kind: 'static property',
      sigs: ['public static pHashCount: number'],
      description: 'A counter used to generate unique auto-prefixes (p0, p1, p2, …) for undeclared namespaces. Reset to zero by XElement.cleanupAfterSerialization() after each serialization.',
      semantics: 'This is a mutable global counter. Do not modify it during serialization.',
      example: ["NamespacePrefixInfo.pHashCount; // 0 (after serialization cleanup)"],
    }),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: [
        'new NamespacePrefixInfo(defaultNamespace: XNamespace, namespacePrefixPairs: NamespacePrefixPair[])',
        'new NamespacePrefixInfo(other: NamespacePrefixInfo)',
      ],
      params: [
        ['defaultNamespace', 'XNamespace', 'The current default namespace (from an xmlns="..." declaration).'],
        ['namespacePrefixPairs', 'NamespacePrefixPair[]', 'The prefix bindings in scope.'],
        ['other', 'NamespacePrefixInfo', 'Copy constructor — deep-copies the pairs array.'],
      ],
      description: 'Creates a new scope, either from scratch or by inheriting from a parent scope.',
      example: [
        "const root = new NamespacePrefixInfo(XNamespace.none, []);",
        "// child scope inheriting from parent:",
        "const child = new NamespacePrefixInfo(root);",
      ],
    }),

    ...member({
      name: 'defaultNamespace',
      kind: 'property',
      sigs: ['public defaultNamespace: XNamespace'],
      description: 'The default namespace currently in scope (from xmlns="..." declarations). XNamespace.none if no default namespace is active.',
      example: ["info.defaultNamespace === XNamespace.none; // true when no xmlns=\"...\" is in scope"],
    }),

    ...member({
      name: 'namespacePrefixPairs',
      kind: 'property',
      sigs: ['public readonly namespacePrefixPairs: NamespacePrefixPair[]'],
      description: 'The list of namespace-to-prefix bindings currently in scope. Entries are added as xmlns:prefix attributes are encountered during the serialization traversal.',
      example: [
        "info.namespacePrefixPairs.forEach(p => {",
        "  console.log(p.prefix, '->', p.namespace.uri);",
        "});",
      ],
    }),
  ];
  await writeDoc('NamespacePrefixInfo', content);
}

// ─── XmlParseError ────────────────────────────────────────────────────────────
async function genXmlParseError() {
  const content = [
    h1('XmlParseError'),
    inheritanceLine('Error → XmlParseError'),
    plain('XmlParseError is thrown by all parse and load methods when input XML is malformed. It extends the native Error class and adds three optional fields that identify the location and source of the error.'),

    ...member({
      name: 'constructor',
      kind: 'constructor',
      sigs: ['new XmlParseError(message: string, line?: number, column?: number, filePath?: string)'],
      params: [
        ['message', 'string', 'Human-readable error description from the SAX parser.'],
        ['line', 'number?', 'One-based line number where the error occurred.'],
        ['column', 'number?', 'One-based column number where the error occurred.'],
        ['filePath', 'string?', 'Source file path; set only when loading from a file.'],
      ],
      description: 'Creates a new XmlParseError. Normally constructed internally by the parser — callers should not need to instantiate this class directly.',
    }),

    ...member({
      name: 'message',
      kind: 'property',
      sigs: ['public readonly message: string  // inherited from Error'],
      description: 'A human-readable description of the parse error, as reported by the underlying SAX parser.',
    }),

    ...member({
      name: 'line',
      kind: 'property',
      sigs: ['public readonly line?: number'],
      description: 'The one-based line number in the source XML where the error was detected, or undefined if unavailable.',
      example: ["try { XElement.parse('<bad'); } catch (e) { console.log(e.line); }"],
    }),

    ...member({
      name: 'column',
      kind: 'property',
      sigs: ['public readonly column?: number'],
      description: 'The one-based column number in the source XML where the error was detected, or undefined if unavailable.',
    }),

    ...member({
      name: 'filePath',
      kind: 'property',
      sigs: ['public readonly filePath?: string'],
      description: 'The file path passed to load() or loadAsync() when the error occurred. Undefined when the error originates from a string-based parse() call.',
      semantics: 'Use this field to surface file-name context in error messages when loading XML from disk.',
      example: [
        "try {",
        "  XDocument.load('/data/config.xml');",
        "} catch (e) {",
        "  if (e instanceof XmlParseError) {",
        "    console.error(`Parse error in ${e.filePath} at line ${e.line}`);",
        "  }",
        "}",
      ],
    }),
  ];
  await writeDoc('XmlParseError', content);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
console.log('Generating class documentation DOCX files...');
await genXObject();
await genXNode();
await genXContainer();
await genXElement();
await genXDocument();
await genXAttribute();
await genXText();
await genXComment();
await genXCData();
await genXProcessingInstruction();
await genXDeclaration();
await genXName();
await genXNamespace();
await genNamespacePrefixPair();
await genNamespacePrefixInfo();
await genXmlParseError();
console.log('Done.');
