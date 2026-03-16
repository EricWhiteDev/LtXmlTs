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
