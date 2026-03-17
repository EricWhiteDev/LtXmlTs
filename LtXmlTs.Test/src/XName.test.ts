import { describe, it, expect } from 'vitest';
import { XName, XNamespace } from 'ltxmlts';

describe('XName constructor — overload 1: XNamespace + localName', () => {
  it('stores the namespace property correctly', () => {
    const ns = new XNamespace('urn:test:xname:ov1:ns');
    const name = new XName(ns, 'foo');
    expect(name.namespace).toBe(ns);
  });

  it('stores the localName property correctly', () => {
    const ns = new XNamespace('urn:test:xname:ov1:local');
    const name = new XName(ns, 'bar');
    expect(name.localName).toBe('bar');
  });

  it('namespaceName equals namespace.uri', () => {
    const ns = new XNamespace('urn:test:xname:ov1:namespacename');
    const name = new XName(ns, 'baz');
    expect(name.namespaceName).toBe(ns.uri);
  });

  it('same namespace + localName called twice returns the same object reference', () => {
    const ns = new XNamespace('urn:test:xname:ov1:same');
    const first = new XName(ns, 'elem');
    const second = new XName(ns, 'elem');
    expect(first).toBe(second);
  });

  it('different localName with same namespace returns a different object reference', () => {
    const ns = new XNamespace('urn:test:xname:ov1:diff-local');
    const a = new XName(ns, 'alpha');
    const b = new XName(ns, 'beta');
    expect(a).not.toBe(b);
  });

  it('different namespace with same localName returns a different object reference', () => {
    const ns1 = new XNamespace('urn:test:xname:ov1:diff-ns:1');
    const ns2 = new XNamespace('urn:test:xname:ov1:diff-ns:2');
    const a = new XName(ns1, 'child');
    const b = new XName(ns2, 'child');
    expect(a).not.toBe(b);
  });
});

describe('XName constructor — overload 2: clark notation string in namespace', () => {
  it('parses the URI and localName from a valid clark string', () => {
    const name = new XName('{urn:test:xname:clark:parse}element');
    expect(name.namespace.uri).toBe('urn:test:xname:clark:parse');
    expect(name.localName).toBe('element');
  });

  it('namespace.uri matches the URI inside the braces', () => {
    const name = new XName('{urn:test:xname:clark:uri}x');
    expect(name.namespace.uri).toBe('urn:test:xname:clark:uri');
  });

  it('localName matches the part after the closing brace', () => {
    const name = new XName('{urn:test:xname:clark:local}myLocal');
    expect(name.localName).toBe('myLocal');
  });

  it('same clark string called twice returns the same object reference', () => {
    const first = new XName('{urn:test:xname:clark:twice}elem');
    const second = new XName('{urn:test:xname:clark:twice}elem');
    expect(first).toBe(second);
  });

  it('clark string and XNamespace+localName overload return the same object reference', () => {
    const ns = new XNamespace('urn:test:xname:clark:cross');
    const fromOv1 = new XName(ns, 'item');
    const fromOv2 = new XName('{urn:test:xname:clark:cross}item');
    expect(fromOv1).toBe(fromOv2);
  });
});

describe('XName constructor — overload 2: plain string (no namespace)', () => {
  it('localName equals the input string', () => {
    const name = new XName('plainLocal');
    expect(name.localName).toBe('plainLocal');
  });

  it('namespace is XNamespace.none', () => {
    const name = new XName('plainNs');
    expect(name.namespace).toBe(XNamespace.none);
  });

  it('namespaceName is an empty string', () => {
    const name = new XName('plainNamespaceName');
    expect(name.namespaceName).toBe('');
  });

  it('same plain string called twice returns the same object reference', () => {
    const first = new XName('plainTwice');
    const second = new XName('plainTwice');
    expect(first).toBe(second);
  });

  it('plain string and XNamespace.none+localName overload return the same object reference', () => {
    const fromOv2 = new XName('plainCross');
    const fromOv1 = new XName(XNamespace.none, 'plainCross');
    expect(fromOv2).toBe(fromOv1);
  });
});

describe('XName constructor — overload 2: invalid clark notation', () => {
  it('throws Error when the opening brace has no closing brace', () => {
    expect(() => new XName('{urn:missing-close')).toThrow(Error);
  });
});

describe('XName.toString', () => {
  it("returns clark notation '{uri}localName' for a name in a namespace", () => {
    const ns = new XNamespace('urn:test:xname:tostring:ns');
    const name = new XName(ns, 'elem');
    expect(name.toString()).toBe('{urn:test:xname:tostring:ns}elem');
  });

  it('returns just the localName for a name with no namespace (XNamespace.none)', () => {
    const name = new XName(XNamespace.none, 'bare');
    expect(name.toString()).toBe('bare');
  });

  it('template literal interpolation produces the same result as explicit toString()', () => {
    const ns = new XNamespace('urn:test:xname:tostring:interp');
    const name = new XName(ns, 'interp');
    expect(`${name}`).toBe(name.toString());
  });
});

describe('XName.get — overload 1: XNamespace + localName', () => {
  it('returns an XName with the correct namespace', () => {
    const ns = new XNamespace('urn:test:xname:get:ov1:ns');
    const name = XName.get(ns, 'foo');
    expect(name.namespace).toBe(ns);
  });

  it('returns an XName with the correct localName', () => {
    const ns = new XNamespace('urn:test:xname:get:ov1:local');
    const name = XName.get(ns, 'bar');
    expect(name.localName).toBe('bar');
  });

  it('called twice with the same args returns the same object reference', () => {
    const ns = new XNamespace('urn:test:xname:get:ov1:same');
    const first = XName.get(ns, 'elem');
    const second = XName.get(ns, 'elem');
    expect(first).toBe(second);
  });

  it('result is the same object reference as new XName(namespace, localName)', () => {
    const ns = new XNamespace('urn:test:xname:get:ov1:cross');
    const fromGet = XName.get(ns, 'item');
    const fromNew = new XName(ns, 'item');
    expect(fromGet).toBe(fromNew);
  });
});

describe('XName.get — overload 2: clark notation string', () => {
  it('parses namespace.uri and localName from a valid clark string', () => {
    const name = XName.get('{urn:test:xname:get:clark:parse}element');
    expect(name.namespace.uri).toBe('urn:test:xname:get:clark:parse');
    expect(name.localName).toBe('element');
  });

  it('called twice with the same clark string returns the same object reference', () => {
    const first = XName.get('{urn:test:xname:get:clark:twice}elem');
    const second = XName.get('{urn:test:xname:get:clark:twice}elem');
    expect(first).toBe(second);
  });

  it('result is the same object reference as new XName(clarkString)', () => {
    const fromGet = XName.get('{urn:test:xname:get:clark:new}x');
    const fromNew = new XName('{urn:test:xname:get:clark:new}x');
    expect(fromGet).toBe(fromNew);
  });

  it('result is the same object reference as get(namespace, localName) for equivalent name', () => {
    const ns = new XNamespace('urn:test:xname:get:clark:equiv');
    const fromClark = XName.get('{urn:test:xname:get:clark:equiv}y');
    const fromNsLocal = XName.get(ns, 'y');
    expect(fromClark).toBe(fromNsLocal);
  });
});

describe('XName.get — overload 2: plain string (no namespace)', () => {
  it('localName equals the input string', () => {
    const name = XName.get('getPlainLocal');
    expect(name.localName).toBe('getPlainLocal');
  });

  it('namespace is XNamespace.none', () => {
    const name = XName.get('getPlainNs');
    expect(name.namespace).toBe(XNamespace.none);
  });

  it('called twice returns the same object reference', () => {
    const first = XName.get('getPlainTwice');
    const second = XName.get('getPlainTwice');
    expect(first).toBe(second);
  });

  it('result is the same object reference as new XName(plainString)', () => {
    const fromGet = XName.get('getPlainNew');
    const fromNew = new XName('getPlainNew');
    expect(fromGet).toBe(fromNew);
  });

  it('result is the same object reference as get(XNamespace.none, plainString)', () => {
    const fromPlain = XName.get('getPlainCross');
    const fromNsLocal = XName.get(XNamespace.none, 'getPlainCross');
    expect(fromPlain).toBe(fromNsLocal);
  });
});

describe('XName.get — overload 2: invalid clark notation', () => {
  it('throws Error when the opening brace has no closing brace', () => {
    expect(() => XName.get('{urn:missing-close')).toThrow(Error);
  });
});

describe('XName cross-checks', () => {
  it('two XName objects with different fully-qualified names are different object references', () => {
    const a = new XName('{urn:test:xname:cross:a}foo');
    const b = new XName('{urn:test:xname:cross:b}foo');
    expect(a).not.toBe(b);
  });

  it('two XName objects with the same fully-qualified name are the same object reference', () => {
    const a = new XName('{urn:test:xname:cross:same}bar');
    const b = new XName('{urn:test:xname:cross:same}bar');
    expect(a).toBe(b);
  });

  it('XName objects with same localName but different namespaces are different object references', () => {
    const ns1 = new XNamespace('urn:test:xname:cross:ns1');
    const ns2 = new XNamespace('urn:test:xname:cross:ns2');
    const a = new XName(ns1, 'shared');
    const b = new XName(ns2, 'shared');
    expect(a).not.toBe(b);
  });
});

describe('XName.equals', () => {
  it('returns true for the same cached instance', () => {
    expect(XName.get('foo').equals(XName.get('foo'))).toBe(true);
  });
  it('returns false when local names differ', () => {
    expect(XName.get('foo').equals(XName.get('bar'))).toBe(false);
  });
  it('returns false when namespaces differ', () => {
    expect(XName.get('{http://a.com}foo').equals(XName.get('{http://b.com}foo'))).toBe(false);
  });
  it('returns true for two calls with same namespaced name', () => {
    expect(XName.get('{http://example.com}id').equals(XName.get('{http://example.com}id'))).toBe(true);
  });
});
