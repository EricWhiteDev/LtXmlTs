import { describe, it, expect } from 'vitest';
import { XElement, XComment, XText, XDocument } from 'ltxmlts';

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
