import { describe, it, expect } from 'vitest';
import { XDocument, XDeclaration } from 'ltxmlts';

describe('XDocument', () => {
  it('sets nodeType to Document', () => {
    const doc = new XDocument();
    expect(doc.nodeType).toBe('Document');
  });

  it('no-arg constructor sets declaration to null', () => {
    const doc = new XDocument();
    expect(doc.declaration).toBeNull();
  });

  it('no-arg constructor sets parent to null', () => {
    const doc = new XDocument();
    expect(doc.parent).toBeNull();
  });

  it('no-arg constructor produces empty nodes', () => {
    const doc = new XDocument();
    expect(doc.nodes()).toHaveLength(0);
  });

  it('declaration constructor sets declaration', () => {
    const decl = new XDeclaration('1.0', 'utf-8', 'yes');
    const doc = new XDocument(decl);
    expect(doc.declaration).toBe(decl);
  });

  it('declaration constructor sets nodeType to Document', () => {
    const decl = new XDeclaration('1.0', 'utf-8', 'yes');
    const doc = new XDocument(decl);
    expect(doc.nodeType).toBe('Document');
  });

  it('declaration constructor sets parent to null', () => {
    const decl = new XDeclaration('1.0', 'utf-8', 'yes');
    const doc = new XDocument(decl);
    expect(doc.parent).toBeNull();
  });

  it('declaration constructor produces empty nodes', () => {
    const decl = new XDeclaration('1.0', 'utf-8', 'yes');
    const doc = new XDocument(decl);
    expect(doc.nodes()).toHaveLength(0);
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
