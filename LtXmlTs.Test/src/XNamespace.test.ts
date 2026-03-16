import { describe, it, expect } from 'vitest';
import { XNamespace } from 'ltxmlts';

describe('XNamespace constructor', () => {
  it('different URIs produce different object references', () => {
    const a = new XNamespace('urn:test:constructor:a');
    const b = new XNamespace('urn:test:constructor:b');
    expect(a).not.toBe(b);
  });

  it('same URI and same prefix returns the same object reference', () => {
    const first = new XNamespace('urn:test:constructor:same-same', 'ns');
    const second = new XNamespace('urn:test:constructor:same-same', 'ns');
    expect(first).toBe(second);
  });

  it('same URI with different prefix returns the same object reference', () => {
    const first = new XNamespace('urn:test:constructor:same-diff', 'old');
    const second = new XNamespace('urn:test:constructor:same-diff', 'new');
    expect(first).toBe(second);
  });
});

describe('XNamespace uri property', () => {
  it('returns the URI passed to the constructor', () => {
    const ns = new XNamespace('urn:test:uri:value');
    expect(ns.uri).toBe('urn:test:uri:value');
  });
});

describe('XNamespace preferredPrefix property', () => {
  it('omitting preferredPrefix returns null', () => {
    const ns = new XNamespace('urn:test:prefix:omit');
    expect(ns.preferredPrefix).toBeNull();
  });

  it('passing null returns null', () => {
    const ns = new XNamespace('urn:test:prefix:null', null);
    expect(ns.preferredPrefix).toBeNull();
  });

  it('passing a prefix returns that prefix', () => {
    const ns = new XNamespace('urn:test:prefix:set', 'p');
    expect(ns.preferredPrefix).toBe('p');
  });

  it('calling constructor again with a different prefix updates preferredPrefix on the cached object', () => {
    const first = new XNamespace('urn:test:prefix:update', 'old');
    new XNamespace('urn:test:prefix:update', 'updated');
    expect(first.preferredPrefix).toBe('updated');
  });

  it('calling constructor again with the same prefix leaves preferredPrefix unchanged', () => {
    const first = new XNamespace('urn:test:prefix:unchanged', 'stable');
    new XNamespace('urn:test:prefix:unchanged', 'stable');
    expect(first.preferredPrefix).toBe('stable');
  });
});

describe('XNamespace.get', () => {
  it('get with a URI not yet cached returns an XNamespace with the correct uri', () => {
    const ns = XNamespace.get('urn:test:get:new');
    expect(ns.uri).toBe('urn:test:get:new');
  });

  it('constructor called first, then get with the same URI returns the same object reference', () => {
    const first = new XNamespace('urn:test:get:ctor-first');
    const second = XNamespace.get('urn:test:get:ctor-first');
    expect(first).toBe(second);
  });

  it('get called first, then constructor with the same URI returns the same object reference', () => {
    const first = XNamespace.get('urn:test:get:get-first');
    const second = new XNamespace('urn:test:get:get-first');
    expect(first).toBe(second);
  });

  it('get called twice with the same URI returns the same object reference', () => {
    const first = XNamespace.get('urn:test:get:twice');
    const second = XNamespace.get('urn:test:get:twice');
    expect(first).toBe(second);
  });
});

describe('XNamespace namespaceName property', () => {
  it('returns the URI passed to the constructor', () => {
    const ns = new XNamespace('urn:test:namespacename:value');
    expect(ns.namespaceName).toBe('urn:test:namespacename:value');
  });

  it('returns an empty string when URI is empty', () => {
    const ns = new XNamespace('urn:test:namespacename:empty');
    const ns2 = new XNamespace('');
    expect(ns2.namespaceName).toBe('');
  });

  it('returns the same value as the uri property', () => {
    const ns = new XNamespace('urn:test:namespacename:same-as-uri');
    expect(ns.namespaceName).toBe(ns.uri);
  });
});

describe('XNamespace.toString', () => {
  it('standard URI returns the URI wrapped in braces', () => {
    const ns = new XNamespace('urn:test:tostring:standard');
    expect(ns.toString()).toBe('{urn:test:tostring:standard}');
  });

  it('empty URI returns empty braces', () => {
    const ns = new XNamespace('');
    expect(ns.toString()).toBe('{}');
  });

  it('template literal interpolation produces the same result as explicit toString()', () => {
    const ns = new XNamespace('urn:test:tostring:interpolation');
    expect(`${ns}`).toBe(ns.toString());
  });
});

describe('XNamespace.none', () => {
  it('has uri equal to empty string', () => {
    expect(XNamespace.none.uri).toBe('');
  });

  it('has preferredPrefix of null', () => {
    expect(XNamespace.none.preferredPrefix).toBeNull();
  });

  it('accessed twice is the same object reference', () => {
    expect(XNamespace.none).toBe(XNamespace.none);
  });

  it('is the same object reference as XNamespace.getNone()', () => {
    expect(XNamespace.none).toBe(XNamespace.getNone());
  });

  it("is the same object reference as new XNamespace('')", () => {
    expect(XNamespace.none).toBe(new XNamespace(''));
  });
});

describe('XNamespace.getNone', () => {
  it('returns an XNamespace with uri equal to empty string', () => {
    const ns = XNamespace.getNone();
    expect(ns.uri).toBe('');
  });

  it('returns an XNamespace with preferredPrefix of null', () => {
    const ns = XNamespace.getNone();
    expect(ns.preferredPrefix).toBeNull();
  });

  it('calling getNone() twice returns the same object reference', () => {
    const first = XNamespace.getNone();
    const second = XNamespace.getNone();
    expect(first).toBe(second);
  });

  it('getNone() result is the same object reference as new XNamespace(\'\')', () => {
    const fromGetNone = XNamespace.getNone();
    const fromCtor = new XNamespace('');
    expect(fromGetNone).toBe(fromCtor);
  });

  it('getNone() result is the same object reference as XNamespace.get(\'\')', () => {
    const fromGetNone = XNamespace.getNone();
    const fromGet = XNamespace.get('');
    expect(fromGetNone).toBe(fromGet);
  });

  it('getNone() result is a different object than an XNamespace with a non-empty URI', () => {
    const none = XNamespace.getNone();
    const other = new XNamespace('urn:test:getnone:nonempty');
    expect(none).not.toBe(other);
  });
});

describe('XNamespace.getXml', () => {
  it('returns an XNamespace with the correct XML namespace URI', () => {
    expect(XNamespace.getXml().uri).toBe('http://www.w3.org/XML/1998/namespace');
  });

  it("returns an XNamespace with preferredPrefix 'xml'", () => {
    expect(XNamespace.getXml().preferredPrefix).toBe('xml');
  });

  it('calling getXml() twice returns the same object reference', () => {
    expect(XNamespace.getXml()).toBe(XNamespace.getXml());
  });

  it('getXml() result is the same object reference as XNamespace.xml', () => {
    expect(XNamespace.getXml()).toBe(XNamespace.xml);
  });

  it("getXmlns() resets preferredPrefix to 'xml' after user code changed it", () => {
    new XNamespace('http://www.w3.org/XML/1998/namespace', 'other');
    const ns = XNamespace.getXml();
    expect(ns.preferredPrefix).toBe('xml');
  });
});

describe('XNamespace.xml', () => {
  it('has the correct XML namespace URI', () => {
    expect(XNamespace.xml.uri).toBe('http://www.w3.org/XML/1998/namespace');
  });

  it("has preferredPrefix 'xml'", () => {
    expect(XNamespace.xml.preferredPrefix).toBe('xml');
  });

  it('is the same object reference as XNamespace.getXml()', () => {
    expect(XNamespace.xml).toBe(XNamespace.getXml());
  });
});

describe('XNamespace.getXmlns', () => {
  it('returns an XNamespace with the correct xmlns URI', () => {
    expect(XNamespace.getXmlns().uri).toBe('http://www.w3.org/2000/xmlns/');
  });

  it("returns an XNamespace with preferredPrefix 'xmlns'", () => {
    expect(XNamespace.getXmlns().preferredPrefix).toBe('xmlns');
  });

  it('calling getXmlns() twice returns the same object reference', () => {
    expect(XNamespace.getXmlns()).toBe(XNamespace.getXmlns());
  });

  it('getXmlns() result is the same object reference as XNamespace.xmlns', () => {
    expect(XNamespace.getXmlns()).toBe(XNamespace.xmlns);
  });

  it("getXmlns() resets preferredPrefix to 'xmlns' after user code changed it", () => {
    new XNamespace('http://www.w3.org/2000/xmlns/', 'other');
    const ns = XNamespace.getXmlns();
    expect(ns.preferredPrefix).toBe('xmlns');
  });
});

describe('XNamespace.xmlns', () => {
  it('has the correct xmlns URI', () => {
    expect(XNamespace.xmlns.uri).toBe('http://www.w3.org/2000/xmlns/');
  });

  it("has preferredPrefix 'xmlns'", () => {
    expect(XNamespace.xmlns.preferredPrefix).toBe('xmlns');
  });

  it('is the same object reference as XNamespace.getXmlns()', () => {
    expect(XNamespace.xmlns).toBe(XNamespace.getXmlns());
  });
});

describe('XNamespace cross-checks', () => {
  it('none, xml, and xmlns are all different object references', () => {
    expect(XNamespace.none).not.toBe(XNamespace.xml);
    expect(XNamespace.none).not.toBe(XNamespace.xmlns);
    expect(XNamespace.xml).not.toBe(XNamespace.xmlns);
  });
});

describe('XNamespace.getName()', () => {
  it('returns an XName whose namespace is the calling XNamespace instance', () => {
    const ns = new XNamespace('http://example.com/');
    const name = ns.getName('foo');
    expect(name.namespace).toBe(ns);
  });

  it('returns an XName whose localName matches the argument', () => {
    const ns = new XNamespace('http://example.com/');
    const name = ns.getName('bar');
    expect(name.localName).toBe('bar');
  });

  it('works when called on XNamespace.none', () => {
    const name = XNamespace.none.getName('local');
    expect(name.namespace).toBe(XNamespace.none);
    expect(name.localName).toBe('local');
    expect(name.namespace.uri).toBe('');
  });

  it('works when called on a named namespace', () => {
    const ns = new XNamespace('http://example.com/ns');
    const name = ns.getName('element');
    expect(name.namespace.uri).toBe('http://example.com/ns');
    expect(name.localName).toBe('element');
  });

  it('returns the same cached object for the same namespace and localName', () => {
    const ns = new XNamespace('http://example.com/');
    const name1 = ns.getName('cached');
    const name2 = ns.getName('cached');
    expect(name1).toBe(name2);
  });

  it('returns different objects for different localNames on the same namespace', () => {
    const ns = new XNamespace('http://example.com/');
    const name1 = ns.getName('alpha');
    const name2 = ns.getName('beta');
    expect(name1).not.toBe(name2);
  });
});
