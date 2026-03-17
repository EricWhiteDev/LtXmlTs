/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XNode, XElement, XComment, XText, XDocument, XName, XAttribute, XDeclaration, XEntity, XCData, XProcessingInstruction } from 'ltxmlts';

describe('XNode.addAfterSelf', () => {
  describe('error cases', () => {
    it('throws when node has no parent', () => {
      const el = new XElement('root');
      expect(() => el.addAfterSelf(new XComment('x'))).toThrow('The parent is missing.');
    });
  });

  describe('insertion order with XElement parent', () => {
    it('inserts after first of two siblings', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      a.addAfterSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'x', 'b']);
    });

    it('inserts after middle of three siblings', () => {
      const parent = new XElement('root',
        new XElement('a'), new XElement('b'), new XElement('c'));
      const nodes = parent.nodes() as XElement[];
      nodes[1].addAfterSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'b', 'x', 'c']);
    });

    it('inserts after last child, appending at end', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const nodes = parent.nodes();
      nodes[1].addAfterSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'b', 'x']);
    });
  });

  describe('content variety', () => {
    it('wraps string content in XText and sets parent', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      a.addAfterSelf('hello');
      const nodes = parent.nodes();
      expect(nodes.length).toBe(2);
      expect(nodes[1]).toBeInstanceOf(XText);
      expect((nodes[1] as XText).value).toBe('hello');
      expect(nodes[1].parent).toBe(parent);
    });

    it('inserts multiple content args in order', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      a.addAfterSelf(new XComment('c1'), new XComment('c2'));
      const nodes = parent.nodes();
      expect(nodes.length).toBe(3);
      expect((nodes[1] as XComment).value).toBe('c1');
      expect((nodes[2] as XComment).value).toBe('c2');
    });

    it('sets parent on XElement content', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      const child = new XElement('x');
      a.addAfterSelf(child);
      expect(child.parent).toBe(parent);
    });
  });

  describe('XDocument parent', () => {
    it('adds a trailing comment after root element', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      root.addAfterSelf(new XComment('trailing'));
      const nodes = doc.nodes();
      expect(nodes.length).toBe(2);
      expect(nodes[1]).toBeInstanceOf(XComment);
      expect((nodes[1] as XComment).value).toBe('trailing');
    });

    it('throws when adding a second XElement to XDocument', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      expect(() => root.addAfterSelf(new XElement('second'))).toThrow(
        'An XDocument may contain only one XElement.'
      );
    });
  });
});

describe('XNode.addBeforeSelf', () => {
  describe('error cases', () => {
    it('throws when node has no parent', () => {
      const el = new XElement('root');
      expect(() => el.addBeforeSelf(new XComment('x'))).toThrow('The parent is missing.');
    });
  });

  describe('insertion order with XElement parent', () => {
    it('inserts before first child', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      a.addBeforeSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['x', 'a', 'b']);
    });

    it('inserts before middle of three siblings', () => {
      const parent = new XElement('root',
        new XElement('a'), new XElement('b'), new XElement('c'));
      const nodes = parent.nodes() as XElement[];
      nodes[1].addBeforeSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'x', 'b', 'c']);
    });

    it('inserts before last child', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const nodes = parent.nodes();
      nodes[1].addBeforeSelf(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'x', 'b']);
    });
  });

  describe('content variety', () => {
    it('wraps string content in XText and sets parent', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      a.addBeforeSelf('hello');
      const nodes = parent.nodes();
      expect(nodes.length).toBe(2);
      expect(nodes[0]).toBeInstanceOf(XText);
      expect((nodes[0] as XText).value).toBe('hello');
      expect(nodes[0].parent).toBe(parent);
    });

    it('inserts multiple content args in order before this', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      a.addBeforeSelf(new XComment('c1'), new XComment('c2'));
      const nodes = parent.nodes();
      expect(nodes.length).toBe(3);
      expect((nodes[0] as XComment).value).toBe('c1');
      expect((nodes[1] as XComment).value).toBe('c2');
    });

    it('sets parent on XElement content', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      const child = new XElement('x');
      a.addBeforeSelf(child);
      expect(child.parent).toBe(parent);
    });
  });

  describe('XDocument parent', () => {
    it('adds a leading comment before root element', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      root.addBeforeSelf(new XComment('leading'));
      const nodes = doc.nodes();
      expect(nodes.length).toBe(2);
      expect(nodes[0]).toBeInstanceOf(XComment);
      expect((nodes[0] as XComment).value).toBe('leading');
    });

    it('throws when adding a second XElement to XDocument', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      expect(() => root.addBeforeSelf(new XElement('second'))).toThrow(
        'An XDocument may contain only one XElement.'
      );
    });
  });
});

describe('XNode.replaceWith', () => {
  describe('error cases', () => {
    it('throws when node has no parent', () => {
      const el = new XElement('root');
      expect(() => el.replaceWith(new XComment('x'))).toThrow('The parent is missing.');
    });
  });

  describe('replacement order with XElement parent', () => {
    it('replaces first of two siblings', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      a.replaceWith(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['x', 'b']);
    });

    it('replaces middle of three siblings', () => {
      const parent = new XElement('root',
        new XElement('a'), new XElement('b'), new XElement('c'));
      const nodes = parent.nodes() as XElement[];
      nodes[1].replaceWith(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'x', 'c']);
    });

    it('replaces last of two siblings', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const nodes = parent.nodes() as XElement[];
      nodes[1].replaceWith(new XElement('x'));
      const names = (parent.nodes() as XElement[]).map(n => n.name.localName);
      expect(names).toEqual(['a', 'x']);
    });
  });

  describe('content variety', () => {
    it('wraps string content in XText and sets parent', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      a.replaceWith('hello');
      const nodes = parent.nodes();
      expect(nodes.length).toBe(1);
      expect(nodes[0]).toBeInstanceOf(XText);
      expect((nodes[0] as XText).value).toBe('hello');
      expect(nodes[0].parent).toBe(parent);
    });

    it('inserts multiple content args in place of this', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      a.replaceWith(new XComment('c1'), new XComment('c2'));
      const nodes = parent.nodes();
      expect(nodes.length).toBe(3);
      expect((nodes[0] as XComment).value).toBe('c1');
      expect((nodes[1] as XComment).value).toBe('c2');
      expect((nodes[2] as XElement).name.localName).toBe('b');
    });

    it('sets parent on XElement content', () => {
      const parent = new XElement('root', new XElement('a'));
      const [a] = parent.nodes();
      const child = new XElement('x');
      a.replaceWith(child);
      expect(child.parent).toBe(parent);
    });
  });

  describe('XDocument parent', () => {
    it('replaces root XElement with a new XElement', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      root.replaceWith(new XElement('newRoot'));
      const nodes = doc.nodes();
      expect(nodes.length).toBe(1);
      expect(nodes[0]).toBeInstanceOf(XElement);
      expect((nodes[0] as XElement).name.localName).toBe('newRoot');
    });

    it('replaces root XElement with a comment', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      root.replaceWith(new XComment('no-root'));
      const nodes = doc.nodes();
      expect(nodes.length).toBe(1);
      expect(nodes[0]).toBeInstanceOf(XComment);
    });

    it('throws when replacing root with two XElements', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      expect(() => root.replaceWith(new XElement('a'), new XElement('b'))).toThrow(
        'An XDocument may contain only one XElement.'
      );
    });
  });
});

describe('XNode.ancestors', () => {
  describe('no-arg overload', () => {
    it('returns [] when node has no parent', () => {
      const el = new XElement('root');
      expect(el.ancestors()).toEqual([]);
    });

    it('returns [] when immediate parent is XDocument', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      expect(root.ancestors()).toEqual([]);
    });

    it('returns [parent] for single XElement parent', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors()).toEqual([parent]);
    });

    it('returns [parent, grandparent] for two levels deep', () => {
      const grandparent = new XElement('grandparent', new XElement('parent', new XElement('child')));
      const parent = grandparent.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors()).toEqual([parent, grandparent]);
    });

    it('returns [parent, grandparent, great-grandparent] for three levels deep', () => {
      const great = new XElement('great', new XElement('grand', new XElement('parent', new XElement('child'))));
      const grand = great.nodes()[0] as XElement;
      const parent = grand.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors()).toEqual([parent, grand, great]);
    });

    it('collects XElement ancestors for XText child', () => {
      const grandparent = new XElement('gp', new XElement('p', new XText('hello')));
      const parent = grandparent.nodes()[0] as XElement;
      const text = parent.nodes()[0] as XText;
      expect(text.ancestors()).toEqual([parent, grandparent]);
    });

    it('collects XElement ancestor chain for XComment child of nested XElement', () => {
      const outer = new XElement('outer', new XElement('inner', new XComment('note')));
      const inner = outer.nodes()[0] as XElement;
      const comment = inner.nodes()[0] as XComment;
      expect(comment.ancestors()).toEqual([inner, outer]);
    });
  });

  describe('named overload (XName arg)', () => {
    it('returns matching ancestor only', () => {
      const grandparent = new XElement('gp', new XElement('p', new XElement('child')));
      const parent = grandparent.nodes()[0] as XElement;
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors(new XName('gp'))).toEqual([grandparent]);
    });

    it('returns [] when no ancestor matches', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors(new XName('other'))).toEqual([]);
    });

    it('returns all matching ancestors in inner-to-outer order', () => {
      const outer = new XElement('foo', new XElement('foo', new XElement('child')));
      const inner = outer.nodes()[0] as XElement;
      const child = inner.nodes()[0] as XElement;
      const result = child.ancestors(new XName('foo'));
      expect(result).toEqual([inner, outer]);
    });

    it('returns only the matching ancestor when top does not match', () => {
      const top = new XElement('top', new XElement('foo', new XElement('child')));
      const mid = top.nodes()[0] as XElement;
      const child = mid.nodes()[0] as XElement;
      expect(child.ancestors(new XName('foo'))).toEqual([mid]);
    });
  });

  describe('named overload (string arg)', () => {
    it('matches ancestor by string name', () => {
      const parent = new XElement('foo', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors('foo')).toEqual([parent]);
    });

    it('returns [] when no ancestor matches string name', () => {
      const parent = new XElement('parent', new XElement('child'));
      const child = parent.nodes()[0] as XElement;
      expect(child.ancestors('other')).toEqual([]);
    });
  });
});

describe('XNode.elementsAfterSelf', () => {
  describe('no-arg overload', () => {
    it('returns [] when node has no parent', () => {
      const el = new XElement('root');
      expect(el.elementsAfterSelf()).toEqual([]);
    });

    it('returns [] when node is the last child', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const nodes = parent.nodes() as XElement[];
      expect(nodes[1].elementsAfterSelf()).toEqual([]);
    });

    it('returns single XElement sibling after', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a, b] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf()).toEqual([b]);
    });

    it('returns two XElement siblings after in document order', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'), new XElement('c'));
      const [a, b, c] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf()).toEqual([b, c]);
    });

    it('excludes non-element siblings (XText, XComment) after', () => {
      const parent = new XElement('root', new XElement('a'), new XText('txt'), new XComment('cmt'));
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf()).toEqual([]);
    });

    it('returns only XElements from a mix of sibling types after', () => {
      const b = new XElement('b');
      const parent = new XElement('root', new XElement('a'), new XText('txt'), b, new XComment('cmt'));
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf()).toEqual([b]);
    });

    it('returns [] for root element with no siblings in XDocument', () => {
      const doc = new XDocument(new XElement('root'));
      const root = doc.nodes()[0] as XElement;
      expect(root.elementsAfterSelf()).toEqual([]);
    });
  });

  describe('named overload (XName arg)', () => {
    it('matches one following sibling by XName', () => {
      const b = new XElement('b');
      const parent = new XElement('root', new XElement('a'), b);
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf(new XName('b'))).toEqual([b]);
    });

    it('returns [] when no following sibling matches XName', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf(new XName('x'))).toEqual([]);
    });

    it('returns all following siblings with same XName in document order', () => {
      const b1 = new XElement('b');
      const b2 = new XElement('b');
      const parent = new XElement('root', new XElement('a'), b1, b2);
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf(new XName('b'))).toEqual([b1, b2]);
    });

    it('returns only matching sibling when not the first following sibling', () => {
      const c = new XElement('c');
      const parent = new XElement('root', new XElement('a'), new XElement('b'), c);
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf(new XName('c'))).toEqual([c]);
    });
  });

  describe('named overload (string arg)', () => {
    it('matches following sibling by string name', () => {
      const foo = new XElement('foo');
      const parent = new XElement('root', new XElement('a'), foo);
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf('foo')).toEqual([foo]);
    });

    it('returns [] when no following sibling matches string name', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [a] = parent.nodes() as XElement[];
      expect(a.elementsAfterSelf('x')).toEqual([]);
    });
  });
});

describe('XNode.elementsBeforeSelf', () => {
  describe('no-arg overload', () => {
    it('returns [] when node has no parent', () => {
      const node = new XElement('a');
      expect(node.elementsBeforeSelf()).toEqual([]);
    });

    it('returns [] when node is the first child', () => {
      const a = new XElement('a');
      const parent = new XElement('root', a, new XElement('b'));
      expect(a.elementsBeforeSelf()).toEqual([]);
    });

    it('returns single XElement sibling before', () => {
      const a = new XElement('a');
      const b = new XElement('b');
      const parent = new XElement('root', a, b);
      expect(b.elementsBeforeSelf()).toEqual([a]);
    });

    it('returns two XElement siblings before in document order', () => {
      const a = new XElement('a');
      const b = new XElement('b');
      const c = new XElement('c');
      const parent = new XElement('root', a, b, c);
      expect(c.elementsBeforeSelf()).toEqual([a, b]);
    });

    it('excludes non-element siblings (XText, XComment) before', () => {
      const txt = new XText('hello');
      const cmt = new XComment('note');
      const b = new XElement('b');
      const parent = new XElement('root', txt, cmt, b);
      expect(b.elementsBeforeSelf()).toEqual([]);
    });

    it('returns only XElements from a mix of siblings before', () => {
      const a = new XElement('a');
      const txt = new XText('hello');
      const b = new XElement('b');
      const c = new XElement('c');
      const parent = new XElement('root', a, txt, b, c);
      expect(c.elementsBeforeSelf()).toEqual([a, b]);
    });

    it('returns [] when node is a child of XDocument with no preceding siblings', () => {
      const root = new XElement('root');
      const doc = new XDocument(root);
      expect(root.elementsBeforeSelf()).toEqual([]);
    });
  });

  describe('named overload (XName arg)', () => {
    it('matches one preceding sibling by XName', () => {
      const a = new XElement('a');
      const b = new XElement('b');
      const parent = new XElement('root', a, b);
      expect(b.elementsBeforeSelf(new XName('a'))).toEqual([a]);
    });

    it('returns [] when no preceding sibling matches XName', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [, b] = parent.nodes() as XElement[];
      expect(b.elementsBeforeSelf(new XName('x'))).toEqual([]);
    });

    it('returns all preceding siblings with same XName in document order', () => {
      const b1 = new XElement('b');
      const b2 = new XElement('b');
      const c = new XElement('c');
      const parent = new XElement('root', b1, b2, c);
      expect(c.elementsBeforeSelf(new XName('b'))).toEqual([b1, b2]);
    });

    it('returns only matching sibling when not the last preceding sibling', () => {
      const a = new XElement('a');
      const b = new XElement('b');
      const c = new XElement('c');
      const parent = new XElement('root', a, b, c);
      expect(c.elementsBeforeSelf(new XName('a'))).toEqual([a]);
    });
  });

  describe('named overload (string arg)', () => {
    it('matches preceding sibling by string name', () => {
      const foo = new XElement('foo');
      const bar = new XElement('bar');
      const parent = new XElement('root', foo, bar);
      expect(bar.elementsBeforeSelf('foo')).toEqual([foo]);
    });

    it('returns [] when no preceding sibling matches string name', () => {
      const parent = new XElement('root', new XElement('a'), new XElement('b'));
      const [, b] = parent.nodes() as XElement[];
      expect(b.elementsBeforeSelf('x')).toEqual([]);
    });
  });
});

describe('XNode.nodesBeforeSelf', () => {
  it('returns [] when node has no parent', () => {
    const el = new XElement('root');
    expect(el.nodesBeforeSelf()).toEqual([]);
  });

  it('returns [] when node is the first child', () => {
    const a = new XElement('a');
    const parent = new XElement('root', a, new XElement('b'));
    expect(a.nodesBeforeSelf()).toEqual([]);
  });

  it('returns single XElement sibling before', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const parent = new XElement('root', a, b);
    expect(b.nodesBeforeSelf()).toEqual([a]);
  });

  it('returns two XElement siblings before in document order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const c = new XElement('c');
    const parent = new XElement('root', a, b, c);
    expect(c.nodesBeforeSelf()).toEqual([a, b]);
  });

  it('returns single XText sibling before', () => {
    const txt = new XText('hello');
    const b = new XElement('b');
    const parent = new XElement('root', txt, b);
    expect(b.nodesBeforeSelf()).toEqual([txt]);
  });

  it('returns single XComment sibling before', () => {
    const cmt = new XComment('note');
    const b = new XElement('b');
    const parent = new XElement('root', cmt, b);
    expect(b.nodesBeforeSelf()).toEqual([cmt]);
  });

  it('returns mixed XElement + XText + XComment before in document order', () => {
    const a = new XElement('a');
    const txt = new XText('hello');
    const cmt = new XComment('note');
    const b = new XElement('b');
    const parent = new XElement('root', a, txt, cmt, b);
    expect(b.nodesBeforeSelf()).toEqual([a, txt, cmt]);
  });

  it('returns [] for child of XDocument with no preceding siblings', () => {
    const root = new XElement('root');
    const doc = new XDocument(root);
    expect(root.nodesBeforeSelf()).toEqual([]);
  });
});

describe('XNode.nodesAfterSelf', () => {
  it('returns [] when node has no parent', () => {
    const el = new XElement('root');
    expect(el.nodesAfterSelf()).toEqual([]);
  });

  it('returns [] when node is the last child', () => {
    const parent = new XElement('root', new XElement('a'), new XElement('b'));
    const nodes = parent.nodes();
    expect(nodes[1].nodesAfterSelf()).toEqual([]);
  });

  it('returns single XElement sibling after', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const parent = new XElement('root', a, b);
    expect(a.nodesAfterSelf()).toEqual([b]);
  });

  it('returns two XElement siblings after in document order', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const c = new XElement('c');
    const parent = new XElement('root', a, b, c);
    expect(a.nodesAfterSelf()).toEqual([b, c]);
  });

  it('returns single XText sibling after', () => {
    const a = new XElement('a');
    const txt = new XText('hello');
    const parent = new XElement('root', a, txt);
    expect(a.nodesAfterSelf()).toEqual([txt]);
  });

  it('returns single XComment sibling after', () => {
    const a = new XElement('a');
    const cmt = new XComment('note');
    const parent = new XElement('root', a, cmt);
    expect(a.nodesAfterSelf()).toEqual([cmt]);
  });

  it('returns mixed XElement + XText + XComment after in document order', () => {
    const a = new XElement('a');
    const txt = new XText('hello');
    const cmt = new XComment('note');
    const b = new XElement('b');
    const parent = new XElement('root', a, txt, cmt, b);
    expect(a.nodesAfterSelf()).toEqual([txt, cmt, b]);
  });

  it('returns [] for child of XDocument with no following siblings', () => {
    const root = new XElement('root');
    const doc = new XDocument(root);
    expect(root.nodesAfterSelf()).toEqual([]);
  });
});

describe('XNode.remove', () => {
  it('throws when node has no parent', () => {
    const node = new XElement('a');
    expect(() => node.remove()).toThrow('The parent is missing.');
  });

  it('removes the only child', () => {
    const child = new XElement('a');
    const parent = new XElement('root', child);
    child.remove();
    expect(parent.nodes()).toEqual([]);
  });

  it('removes the first of two siblings', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const parent = new XElement('root', a, b);
    a.remove();
    expect(parent.nodes()).toEqual([b]);
  });

  it('removes the middle of three siblings', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const c = new XElement('c');
    const parent = new XElement('root', a, b, c);
    b.remove();
    expect(parent.nodes()).toEqual([a, c]);
  });

  it('removes the last of two siblings', () => {
    const a = new XElement('a');
    const b = new XElement('b');
    const parent = new XElement('root', a, b);
    b.remove();
    expect(parent.nodes()).toEqual([a]);
  });

  it('sets parent to null after removal', () => {
    const child = new XElement('a');
    const parent = new XElement('root', child);
    child.remove();
    expect(child.parent).toBeNull();
  });

  it('removes an XText node', () => {
    const txt = new XText('hello');
    const parent = new XElement('root', txt);
    txt.remove();
    expect(parent.nodes()).toEqual([]);
  });

  it('removes an XComment node', () => {
    const cmt = new XComment('note');
    const parent = new XElement('root', cmt);
    cmt.remove();
    expect(parent.nodes()).toEqual([]);
  });

  it('removes a comment child of XDocument leaving only root element', () => {
    const root = new XElement('root');
    const cmt = new XComment('doc-comment');
    const doc = new XDocument(cmt, root);
    cmt.remove();
    expect(doc.nodes()).toEqual([root]);
  });
});

describe('XNode.deepEquals', () => {
  // Instance method — same-type equal nodes
  it('returns true for two equal XText nodes', () => {
    expect(new XText('hello').deepEquals(new XText('hello'))).toBe(true);
  });
  it('returns true for two equal XComment nodes', () => {
    expect(new XComment('note').deepEquals(new XComment('note'))).toBe(true);
  });
  it('returns true for two equal XCData nodes', () => {
    expect(new XCData('raw').deepEquals(new XCData('raw'))).toBe(true);
  });
  it('returns true for two equal XEntity nodes', () => {
    expect(new XEntity('amp').deepEquals(new XEntity('amp'))).toBe(true);
  });
  it('returns true for two equal XProcessingInstruction nodes', () => {
    expect(new XProcessingInstruction('xml-stylesheet', 'type="text/css"')
      .deepEquals(new XProcessingInstruction('xml-stylesheet', 'type="text/css"'))).toBe(true);
  });
  it('returns true for two equal XElement nodes', () => {
    const a = new XElement('root', new XAttribute('id', '1'), new XText('hello'));
    const b = new XElement('root', new XAttribute('id', '1'), new XText('hello'));
    expect(a.deepEquals(b)).toBe(true);
  });
  it('returns true for two equal XDocument nodes', () => {
    const a = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'), new XElement('root'));
    const b = new XDocument(new XDeclaration('1.0', 'utf-8', 'yes'), new XElement('root'));
    expect(a.deepEquals(b)).toBe(true);
  });

  // Instance method — same-type unequal nodes
  it('returns false for two unequal XText nodes', () => {
    expect(new XText('hello').deepEquals(new XText('world'))).toBe(false);
  });
  it('returns false for two unequal XElement nodes', () => {
    expect(new XElement('foo').deepEquals(new XElement('bar'))).toBe(false);
  });

  // Instance method — mismatched types
  it('returns false when node types differ', () => {
    expect(new XText('x').deepEquals(new XComment('x'))).toBe(false);
  });
  it('returns false for XElement vs XDocument', () => {
    expect(new XElement('root').deepEquals(new XDocument())).toBe(false);
  });

  // Static method
  it('static deepEquals returns true for equal nodes', () => {
    expect(XNode.deepEquals(new XText('hello'), new XText('hello'))).toBe(true);
  });
  it('static deepEquals returns false for unequal nodes', () => {
    expect(XNode.deepEquals(new XText('hello'), new XText('world'))).toBe(false);
  });
  it('static deepEquals returns false for mismatched types', () => {
    expect(XNode.deepEquals(new XText('x'), new XComment('x'))).toBe(false);
  });
});
