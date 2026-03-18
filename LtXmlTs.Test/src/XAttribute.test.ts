/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { XAttribute, XElement, XName, XNamespace } from 'ltxmlts';

describe('XAttribute', () => {
  it('sets nodeType to Attribute', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.nodeType).toBe('Attribute');
  });

  it('constructor with name only sets value to empty string', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.value).toBe('');
  });

  it('constructor with name only sets name', () => {
    const a = new XAttribute(XName.get('id'));
    expect(a.name).toBe(XName.get('id'));
  });

  it('constructor with string content sets value', () => {
    const a = new XAttribute(XName.get('id'), 'abc');
    expect(a.value).toBe('abc');
  });

  it('constructor with non-string content converts via toString', () => {
    const a = new XAttribute(XName.get('count'), 42);
    expect(a.value).toBe('42');
  });

  it('constructor with null content throws', () => {
    expect(() => new XAttribute(XName.get('id'), null)).toThrow();
  });

  it('constructor with undefined content throws', () => {
    expect(() => new XAttribute(XName.get('id'), undefined)).toThrow();
  });

  it('copy constructor copies name and value', () => {
    const a = new XAttribute(XName.get('id'), 'abc');
    const b = new XAttribute(a);
    expect(b.name).toBe(XName.get('id'));
    expect(b.value).toBe('abc');
  });

  it('copy constructor sets nodeType to Attribute', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const b = new XAttribute(a);
    expect(b.nodeType).toBe('Attribute');
  });

  it('copy constructor produces a distinct object', () => {
    const a = new XAttribute(XName.get('id'), '1');
    const b = new XAttribute(a);
    expect(b).not.toBe(a);
  });

  it('string constructor sets name via clark notation (plain)', () => {
    const a = new XAttribute('id');
    expect(a.name).toBe(XName.get('id'));
  });

  it('string constructor sets name via clark notation (namespaced)', () => {
    const a = new XAttribute('{http://example.com}id');
    expect(a.name).toBe(XName.get('{http://example.com}id'));
  });

  it('string constructor with content sets value', () => {
    const a = new XAttribute('id', '42');
    expect(a.name).toBe(XName.get('id'));
    expect(a.value).toBe('42');
  });

  it('string constructor with namespaced name and content sets value', () => {
    const a = new XAttribute('{http://example.com}id', 'val');
    expect(a.name).toBe(XName.get('{http://example.com}id'));
    expect(a.value).toBe('val');
  });
});

describe('XAttribute.equals', () => {
  it('returns true when name and value are equal', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('id', 'val'))).toBe(true);
  });
  it('returns false when names differ', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('class', 'val'))).toBe(false);
  });
  it('returns false when values differ', () => {
    expect(new XAttribute('id', 'val').equals(new XAttribute('id', 'other'))).toBe(false);
  });
  it('returns true for namespaced name compared by toString', () => {
    expect(new XAttribute('{http://example.com}id', 'v')
      .equals(new XAttribute('{http://example.com}id', 'v'))).toBe(true);
  });
});

describe('XAttribute.remove', () => {
  it('throws when attribute has no parent', () => {
    const a = new XAttribute('id', 'val');
    expect(() => a.remove()).toThrow('The parent is missing.');
  });

  it('removes the only attribute from parent', () => {
    const el = new XElement('root', new XAttribute('id', '1'));
    const a = el.firstAttribute!;
    a.remove();
    expect(el.attributes()).toHaveLength(0);
  });

  it('removes first of two attributes', () => {
    const el = new XElement('root', new XAttribute('a', '1'), new XAttribute('b', '2'));
    el.firstAttribute!.remove();
    const attrs = el.attributes();
    expect(attrs).toHaveLength(1);
    expect(attrs[0].name.toString()).toBe('b');
  });

  it('removes last of two attributes', () => {
    const el = new XElement('root', new XAttribute('a', '1'), new XAttribute('b', '2'));
    el.lastAttribute!.remove();
    const attrs = el.attributes();
    expect(attrs).toHaveLength(1);
    expect(attrs[0].name.toString()).toBe('a');
  });

  it('removes middle of three attributes', () => {
    const el = new XElement('root',
      new XAttribute('a', '1'),
      new XAttribute('b', '2'),
      new XAttribute('c', '3'),
    );
    el.attributes()[1].remove();
    const attrs = el.attributes();
    expect(attrs).toHaveLength(2);
    expect(attrs[0].name.toString()).toBe('a');
    expect(attrs[1].name.toString()).toBe('c');
  });

  it('sets parent to null after removal', () => {
    const el = new XElement('root', new XAttribute('id', '1'));
    const a = el.firstAttribute!;
    a.remove();
    expect(a.parent).toBeNull();
  });

  it('attribute is no longer returned by parent.attributes() after removal', () => {
    const el = new XElement('root', new XAttribute('id', '1'));
    const a = el.firstAttribute!;
    a.remove();
    expect(el.attributes()).not.toContain(a);
  });
});

describe('XAttribute.value', () => {
  it('can be set via direct assignment', () => {
    const a = new XAttribute('id', 'original');
    a.value = 'updated';
    expect(a.value).toBe('updated');
  });
});

describe('XAttribute.parent', () => {
  it('is set to the parent XElement when added to an element', () => {
    const el = new XElement('root', new XAttribute('id', '1'));
    const a = el.firstAttribute!;
    expect(a.parent).toBe(el);
  });
});

describe('XAttribute.setValue', () => {
  it('sets value on a parentless attribute', () => {
    const a = new XAttribute('id', 'original');
    a.setValue('updated');
    expect(a.value).toBe('updated');
  });

  it('sets value on an attribute with a parent', () => {
    const el = new XElement('root', new XAttribute('id', 'original'));
    const a = el.firstAttribute!;
    a.setValue('updated');
    expect(el.firstAttribute!.value).toBe('updated');
  });

  it('sets value to empty string', () => {
    const a = new XAttribute('id', 'something');
    a.setValue('');
    expect(a.value).toBe('');
  });

  it('value property reflects new value after setValue', () => {
    const a = new XAttribute('id', 'old');
    a.setValue('new');
    expect(a.value).toBe('new');
  });

  it('throws when called with null', () => {
    const a = new XAttribute('id', 'val');
    expect(() => a.setValue(null as any)).toThrow('XAttribute value cannot be null or undefined');
  });

  it('throws when called with undefined', () => {
    const a = new XAttribute('id', 'val');
    expect(() => a.setValue(undefined as any)).toThrow('XAttribute value cannot be null or undefined');
  });
});

describe('XAttribute.isNamespaceDeclaration', () => {
  it('returns true for a default namespace declaration (xmlns="...")', () => {
    const a = new XAttribute(XNamespace.xmlns.getName('xmlns'), 'http://example.com');
    expect(a.isNamespaceDeclaration).toBe(true);
  });

  it('returns true for a prefixed namespace declaration (xmlns:foo="...")', () => {
    const a = new XAttribute(XNamespace.xmlns.getName('foo'), 'http://example.com');
    expect(a.isNamespaceDeclaration).toBe(true);
  });

  it('returns false for a plain attribute with no namespace', () => {
    const a = new XAttribute('id', 'val');
    expect(a.isNamespaceDeclaration).toBe(false);
  });

  it('returns false for an attribute in the xml namespace', () => {
    const a = new XAttribute(XNamespace.xml.getName('lang'), 'en');
    expect(a.isNamespaceDeclaration).toBe(false);
  });

  it('returns false for an attribute named "xmlns" but in no namespace', () => {
    const a = new XAttribute('xmlns', 'http://example.com');
    expect(a.isNamespaceDeclaration).toBe(false);
  });
});

describe('XAttribute.nextAttribute and previousAttribute', () => {
  it('nextAttribute returns the next sibling for a middle attribute', () => {
    const el = new XElement('root',
      new XAttribute('a', '1'),
      new XAttribute('b', '2'),
      new XAttribute('c', '3'),
    );
    const attrs = el.attributes();
    expect(attrs[1].nextAttribute).toBe(attrs[2]);
  });

  it('previousAttribute returns the previous sibling for a middle attribute', () => {
    const el = new XElement('root',
      new XAttribute('a', '1'),
      new XAttribute('b', '2'),
      new XAttribute('c', '3'),
    );
    const attrs = el.attributes();
    expect(attrs[1].previousAttribute).toBe(attrs[0]);
  });

  it('previousAttribute returns null for the first attribute', () => {
    const el = new XElement('root',
      new XAttribute('a', '1'),
      new XAttribute('b', '2'),
    );
    expect(el.firstAttribute!.previousAttribute).toBeNull();
  });

  it('nextAttribute returns null for the last attribute', () => {
    const el = new XElement('root',
      new XAttribute('a', '1'),
      new XAttribute('b', '2'),
    );
    expect(el.lastAttribute!.nextAttribute).toBeNull();
  });

  it('nextAttribute returns null for the only attribute', () => {
    const el = new XElement('root', new XAttribute('a', '1'));
    expect(el.firstAttribute!.nextAttribute).toBeNull();
  });

  it('previousAttribute returns null for the only attribute', () => {
    const el = new XElement('root', new XAttribute('a', '1'));
    expect(el.firstAttribute!.previousAttribute).toBeNull();
  });

  it('nextAttribute returns null for an attribute with no parent', () => {
    const a = new XAttribute('a', '1');
    expect(a.nextAttribute).toBeNull();
  });

  it('previousAttribute returns null for an attribute with no parent', () => {
    const a = new XAttribute('a', '1');
    expect(a.previousAttribute).toBeNull();
  });
});
