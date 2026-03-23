/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import { NamespacePrefixInfo, NamespacePrefixPair, XNamespace } from 'ltxmlts';

describe('NamespacePrefixInfo copy constructor', () => {
  it('produces independent pair objects — mutating prefix in copy does not affect original', () => {
    const ns = new XNamespace('urn:test:copy:independence');
    const original = new NamespacePrefixInfo(XNamespace.none, [
      new NamespacePrefixPair(ns, 'orig'),
    ]);
    const copy = new NamespacePrefixInfo(original);

    copy.namespacePrefixPairs[0].prefix = 'mutated';

    expect(original.namespacePrefixPairs[0].prefix).toBe('orig');
  });

  it('copies all pairs with the same namespace and prefix values', () => {
    const ns1 = new XNamespace('urn:test:copy:values1');
    const ns2 = new XNamespace('urn:test:copy:values2');
    const original = new NamespacePrefixInfo(XNamespace.none, [
      new NamespacePrefixPair(ns1, 'a'),
      new NamespacePrefixPair(ns2, 'b'),
    ]);
    const copy = new NamespacePrefixInfo(original);

    expect(copy.namespacePrefixPairs).toHaveLength(2);
    expect(copy.namespacePrefixPairs[0].namespace).toBe(ns1);
    expect(copy.namespacePrefixPairs[0].prefix).toBe('a');
    expect(copy.namespacePrefixPairs[1].namespace).toBe(ns2);
    expect(copy.namespacePrefixPairs[1].prefix).toBe('b');
  });

  it('copies pair objects by value — pairs in the copy are not the same references as in the original', () => {
    const ns = new XNamespace('urn:test:copy:identity');
    const originalPair = new NamespacePrefixPair(ns, 'x');
    const original = new NamespacePrefixInfo(XNamespace.none, [originalPair]);
    const copy = new NamespacePrefixInfo(original);

    expect(copy.namespacePrefixPairs[0]).not.toBe(originalPair);
  });
});
