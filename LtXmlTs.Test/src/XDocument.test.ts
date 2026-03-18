/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import {
  XDocument, XDeclaration, XElement, XName, XComment, XText,
  XProcessingInstruction, XAttribute, XEntity, XCData,
} from 'ltxmlts';

describe('XDocument', () => {
  describe('constructor() — no-arg', () => {
    it('sets nodeType to Document', () => {
      const doc = new XDocument();
      expect(doc.nodeType).toBe('Document');
    });

    it('sets declaration to null', () => {
      const doc = new XDocument();
      expect(doc.declaration).toBeNull();
    });

    it('sets parent to null', () => {
      const doc = new XDocument();
      expect(doc.parent).toBeNull();
    });

    it('produces empty nodes', () => {
      const doc = new XDocument();
      expect(doc.nodes()).toHaveLength(0);
    });
  });

  describe('constructor(declaration: XDeclaration)', () => {
    it('sets declaration', () => {
      const decl = new XDeclaration('1.0', 'utf-8', 'yes');
      const doc = new XDocument(decl);
      expect(doc.declaration).toBe(decl);
    });

    it('sets nodeType to Document', () => {
      const doc = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'));
      expect(doc.nodeType).toBe('Document');
    });

    it('sets parent to null', () => {
      const doc = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'));
      expect(doc.parent).toBeNull();
    });

    it('produces empty nodes', () => {
      const doc = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'));
      expect(doc.nodes()).toHaveLength(0);
    });
  });

  describe('constructor(other: XDocument) — copy constructor', () => {
    it('produces a distinct object', () => {
      const doc = new XDocument();
      expect(new XDocument(doc)).not.toBe(doc);
    });

    it('copies declaration', () => {
      const decl = new XDeclaration('1.0', 'utf-8', 'yes');
      const doc = new XDocument(decl);
      const copy = new XDocument(doc);
      expect(copy.declaration).not.toBeNull();
      expect(copy.declaration).not.toBe(decl);
      expect(copy.declaration!.version).toBe('1.0');
    });

    it('sets declaration to null when original has none', () => {
      const copy = new XDocument(new XDocument());
      expect(copy.declaration).toBeNull();
    });

    it('copies child nodes', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      const copy = new XDocument(doc);
      expect(copy.nodes()).toHaveLength(1);
    });

    it('clones child XElement (distinct object)', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      const copy = new XDocument(doc);
      expect(copy.nodes()[0]).not.toBe(elem);
    });

    it('sets parent of copied nodes to the new document', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      const copy = new XDocument(doc);
      expect(copy.nodes()[0].parent).toBe(copy);
    });

    it('copies XComment nodes', () => {
      const comment = new XComment('hello');
      const doc = new XDocument(comment);
      const copy = new XDocument(doc);
      expect(copy.nodes()).toHaveLength(1);
      expect((copy.nodes()[0] as XComment).value).toBe('hello');
    });

    it('copies XProcessingInstruction nodes', () => {
      const pi = new XProcessingInstruction('target', 'data');
      const doc = new XDocument(pi);
      const copy = new XDocument(doc);
      expect(copy.nodes()).toHaveLength(1);
      expect((copy.nodes()[0] as XProcessingInstruction).target).toBe('target');
    });

    it('sets nodeType to Document', () => {
      const copy = new XDocument(new XDocument());
      expect(copy.nodeType).toBe('Document');
    });
  });

  describe('constructor(...content) — content-only', () => {
    it('sets declaration to null', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      expect(doc.declaration).toBeNull();
    });

    it('adds an XElement', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      expect(doc.nodes()).toHaveLength(1);
      expect(doc.nodes()[0]).toBe(elem);
    });

    it('sets parent of XElement to document', () => {
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(elem);
      expect(elem.parent).toBe(doc);
    });

    it('clones XElement that already has a parent', () => {
      const elem = new XElement(XName.get('root'));
      const doc1 = new XDocument(elem);
      const doc2 = new XDocument(elem);
      expect(doc2.nodes()[0]).not.toBe(elem);
      expect((doc2.nodes()[0] as XElement).name).toBe(XName.get('root'));
    });

    it('adds an XComment', () => {
      const comment = new XComment('hi');
      const doc = new XDocument(comment);
      expect(doc.nodes()).toHaveLength(1);
      expect((doc.nodes()[0] as XComment).value).toBe('hi');
    });

    it('clones XComment that already has a parent', () => {
      const comment = new XComment('hi');
      const doc1 = new XDocument(comment);
      const doc2 = new XDocument(comment);
      expect(doc2.nodes()[0]).not.toBe(comment);
    });

    it('adds an XProcessingInstruction', () => {
      const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css"');
      const doc = new XDocument(pi);
      expect(doc.nodes()).toHaveLength(1);
      expect((doc.nodes()[0] as XProcessingInstruction).target).toBe('xml-stylesheet');
    });

    it('clones XProcessingInstruction that already has a parent', () => {
      const pi = new XProcessingInstruction('target', 'data');
      const doc1 = new XDocument(pi);
      const doc2 = new XDocument(pi);
      expect(doc2.nodes()[0]).not.toBe(pi);
    });

    it('adds whitespace-only string as XText', () => {
      const doc = new XDocument('   ');
      expect(doc.nodes()).toHaveLength(1);
      expect((doc.nodes()[0] as XText).value).toBe('   ');
    });

    it('adds whitespace-only XText node', () => {
      const text = new XText('  ');
      const doc = new XDocument(text);
      expect(doc.nodes()).toHaveLength(1);
    });

    it('clones whitespace XText that already has a parent', () => {
      const text = new XText('  ');
      const doc1 = new XDocument(text);
      const doc2 = new XDocument(text);
      expect(doc2.nodes()[0]).not.toBe(text);
    });

    it('silently skips null', () => {
      const doc = new XDocument(null);
      expect(doc.nodes()).toHaveLength(0);
    });

    it('silently skips undefined', () => {
      const doc = new XDocument(undefined);
      expect(doc.nodes()).toHaveLength(0);
    });

    it('silently skips unknown types', () => {
      const doc = new XDocument(42 as unknown);
      expect(doc.nodes()).toHaveLength(0);
    });

    it('flattens array content', () => {
      const comment = new XComment('c');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument([comment, elem]);
      expect(doc.nodes()).toHaveLength(2);
    });

    it('accepts multiple spread arguments', () => {
      const comment = new XComment('c');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(comment, elem);
      expect(doc.nodes()).toHaveLength(2);
    });

    it('throws on XAttribute', () => {
      const attr = new XAttribute(XName.get('id'), '1');
      expect(() => new XDocument(attr)).toThrow();
    });

    it('throws on XEntity', () => {
      expect(() => new XDocument(new XEntity('amp', '&amp;'))).toThrow();
    });

    it('throws on XCData', () => {
      expect(() => new XDocument(new XCData('<foo/>'))).toThrow();
    });

    it('throws on non-whitespace string', () => {
      expect(() => new XDocument('hello')).toThrow();
    });

    it('throws on XText with non-whitespace', () => {
      expect(() => new XDocument(new XText('hello'))).toThrow();
    });

    it('throws on a second XElement', () => {
      const e1 = new XElement(XName.get('root'));
      const e2 = new XElement(XName.get('other'));
      expect(() => new XDocument(e1, e2)).toThrow();
    });
  });

  describe('constructor(declaration, ...content)', () => {
    it('sets declaration', () => {
      const decl = new XDeclaration('1.0', 'utf-8', 'yes');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(decl, elem);
      expect(doc.declaration).toBe(decl);
    });

    it('adds content nodes', () => {
      const decl = new XDeclaration('1.0', 'utf-8', 'yes');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(decl, elem);
      expect(doc.nodes()).toHaveLength(1);
      expect(doc.nodes()[0]).toBe(elem);
    });

    it('sets parent of content nodes to document', () => {
      const decl = new XDeclaration('1.0');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(decl, elem);
      expect(elem.parent).toBe(doc);
    });

    it('accepts multiple content args alongside declaration', () => {
      const decl = new XDeclaration('1.0');
      const comment = new XComment('c');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(decl, comment, elem);
      expect(doc.nodes()).toHaveLength(2);
    });

    it('accepts array content alongside declaration', () => {
      const decl = new XDeclaration('1.0');
      const comment = new XComment('c');
      const elem = new XElement(XName.get('root'));
      const doc = new XDocument(decl, [comment, elem]);
      expect(doc.nodes()).toHaveLength(2);
    });

    it('throws on XAttribute in content', () => {
      const decl = new XDeclaration('1.0');
      expect(() => new XDocument(decl, new XAttribute(XName.get('id'), '1'))).toThrow();
    });

    it('throws on non-whitespace string in content', () => {
      const decl = new XDeclaration('1.0');
      expect(() => new XDocument(decl, 'hello')).toThrow();
    });

    it('throws on a second XElement in content', () => {
      const decl = new XDeclaration('1.0');
      const e1 = new XElement(XName.get('root'));
      const e2 = new XElement(XName.get('other'));
      expect(() => new XDocument(decl, e1, e2)).toThrow();
    });
  });

  describe('annotations (inherited from XObject)', () => {
    it('addAnnotation and annotation work', () => {
      class Tag { constructor(public v: string) {} }
      const doc = new XDocument();
      doc.addAnnotation(new Tag('x'));
      expect(doc.annotation(Tag)?.v).toBe('x');
    });

    it('removeAnnotations clears all annotations', () => {
      class Tag { constructor(public v: string) {} }
      const doc = new XDocument();
      doc.addAnnotation(new Tag('x'));
      doc.removeAnnotations();
      expect(doc.annotation(Tag)).toBeNull();
    });
  });
});

describe('XDocument.equals', () => {
  it('returns true for two empty documents with no declaration', () => {
    expect(new XDocument().equals(new XDocument())).toBe(true);
  });
  it('returns true when both have the same declaration and same content', () => {
    const a = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'), new XElement('root'));
    const b = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'), new XElement('root'));
    expect(a.equals(b)).toBe(true);
  });
  it('returns false when one has a declaration and the other does not', () => {
    const a = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'));
    const b = new XDocument();
    expect(a.equals(b)).toBe(false);
  });
  it('returns false when declarations differ', () => {
    const a = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'));
    const b = new XDocument(new XDeclaration('1.1', 'utf-8', 'yes'));
    expect(a.equals(b)).toBe(false);
  });
  it('returns false when root elements differ', () => {
    const a = new XDocument(new XElement('root', new XText('a')));
    const b = new XDocument(new XElement('root', new XText('b')));
    expect(a.equals(b)).toBe(false);
  });
});

describe('XDocument.add', () => {
  it('appends a root element to an empty document', () => {
    const doc = new XDocument();
    doc.add(new XElement('root'));
    expect(doc.nodes()).toHaveLength(1);
    expect(doc.nodes()[0]).toBeInstanceOf(XElement);
  });

  it('appends a comment before the root element', () => {
    const doc = new XDocument();
    doc.add(new XComment('preamble'));
    doc.add(new XElement('root'));
    expect(doc.nodes()).toHaveLength(2);
    expect(doc.nodes()[0]).toBeInstanceOf(XComment);
    expect(doc.nodes()[1]).toBeInstanceOf(XElement);
  });

  it('throws when a second root element is added', () => {
    const doc = new XDocument(new XElement('root'));
    expect(() => doc.add(new XElement('other'))).toThrow();
  });

  it('throws when an XAttribute is added', () => {
    const doc = new XDocument();
    expect(() => doc.add(new XAttribute('id', '1'))).toThrow();
  });
});

describe('XDocument.addFirst', () => {
  it('prepends a root element to an empty document', () => {
    const doc = new XDocument();
    doc.addFirst(new XElement('root'));
    expect(doc.nodes()).toHaveLength(1);
    expect(doc.nodes()[0]).toBeInstanceOf(XElement);
  });

  it('prepends a comment before existing content', () => {
    const doc = new XDocument(new XElement('root'));
    doc.addFirst(new XComment('preamble'));
    expect(doc.nodes()).toHaveLength(2);
    expect(doc.nodes()[0]).toBeInstanceOf(XComment);
    expect(doc.nodes()[1]).toBeInstanceOf(XElement);
  });

  it('throws when a second root element is added', () => {
    const doc = new XDocument(new XElement('root'));
    expect(() => doc.addFirst(new XElement('other'))).toThrow();
  });

  it('throws when an XAttribute is added', () => {
    const doc = new XDocument();
    expect(() => doc.addFirst(new XAttribute('id', '1'))).toThrow();
  });
});

describe('XDocument.replaceNodes', () => {
  it('replaces existing root element with a new one', () => {
    const doc = new XDocument(new XElement('old'));
    doc.replaceNodes(new XElement('new'));
    expect(doc.nodes()).toHaveLength(1);
    expect((doc.nodes()[0] as XElement).name.toString()).toBe('new');
  });

  it('clears all nodes when called with no arguments', () => {
    const doc = new XDocument(new XElement('root'));
    doc.replaceNodes();
    expect(doc.nodes()).toHaveLength(0);
  });

  it('replaces with comment followed by element', () => {
    const doc = new XDocument(new XElement('old'));
    doc.replaceNodes(new XComment('preamble'), new XElement('root'));
    expect(doc.nodes()).toHaveLength(2);
    expect(doc.nodes()[0]).toBeInstanceOf(XComment);
    expect(doc.nodes()[1]).toBeInstanceOf(XElement);
  });

  it('nulls parent on removed nodes', () => {
    const root = new XElement('root');
    const doc = new XDocument(root);
    doc.replaceNodes(new XElement('new'));
    expect(root.parent).toBeNull();
  });

  it('throws when two root elements are provided', () => {
    const doc = new XDocument(new XElement('old'));
    expect(() => doc.replaceNodes(new XElement('a'), new XElement('b'))).toThrow();
  });

  it('throws when an XAttribute is provided', () => {
    const doc = new XDocument(new XElement('root'));
    expect(() => doc.replaceNodes(new XAttribute('id', '1'))).toThrow();
  });
});

describe('XDocument.descendantNodes', () => {
  it('returns empty array for an empty document', () => {
    const doc = new XDocument();
    expect(doc.descendantNodes()).toHaveLength(0);
  });

  it('returns root element and its descendants', () => {
    const child = new XElement('child');
    const root = new XElement('root', child);
    const doc = new XDocument(root);
    const result = doc.descendantNodes();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(root);
    expect(result[1]).toBe(child);
  });

  it('includes comment nodes at the document level', () => {
    const comment = new XComment('preamble');
    const root = new XElement('root');
    const doc = new XDocument(comment, root);
    const result = doc.descendantNodes();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(comment);
    expect(result[1]).toBe(root);
  });

  it('returns document-level comment and deeply nested descendants', () => {
    const grandchild = new XElement('gc');
    const child = new XElement('child', grandchild);
    const root = new XElement('root', child);
    const doc = new XDocument(root);
    const result = doc.descendantNodes();
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(root);
    expect(result[1]).toBe(child);
    expect(result[2]).toBe(grandchild);
  });
});
