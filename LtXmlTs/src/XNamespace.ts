/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XName } from './XName.js';
import type { XObject } from './XObject.js';
import type { NamespacePrefixInfo, NamespacePrefixPair } from './NamespacePrefixInfo.js';

class XNamespaceCacheEntry {
  namespace: XNamespace;
  preferredPrefix: string | null;

  constructor(namespace: XNamespace, preferredPrefix: string | null) {
    this.namespace = namespace;
    this.preferredPrefix = preferredPrefix;
  }
}

export class XNamespace {
  private static namespaceCache: Map<string, XNamespaceCacheEntry> = new Map();

  public static readonly none: XNamespace = new XNamespace('');
  public static readonly xml: XNamespace = new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  public static readonly xmlns: XNamespace = new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');

  public readonly uri: string;

  public get preferredPrefix(): string | null {
    return XNamespace.namespaceCache.get(this.uri)?.preferredPrefix ?? null;
  }

  public get namespaceName(): string {
    return this.uri;
  }

  public static get(uri: string): XNamespace {
    return new XNamespace(uri);
  }

  public static getNone(): XNamespace {
    return new XNamespace('');
  }

  public static getXml(): XNamespace {
    return new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  }

  public static getXmlns(): XNamespace {
    return new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');
  }

  public toString(): string {
    return this.uri === '' ? '' : `{${this.uri}}`;
  }

  public getName(localName: string): XName {
    return new XName(this, localName);
  }

  public equals(other: XNamespace): boolean {
    return this === other;
  }

  public getPrefix(contextObject: XObject): string {
    if (contextObject.nodeType === 'Attribute') {
      const attrName = (contextObject as any).name as XName;
      if (attrName.namespace === XNamespace.none) {
        return '';
      }
      contextObject = contextObject.parent as XObject;
      if (contextObject === null) return '';
    }
    const info = contextObject.namespacePrefixInfo as NamespacePrefixInfo | null;
    if (info === null) return '';
    const pair = info.namespacePrefixPairs.find((p: NamespacePrefixPair) => p.namespace === this);
    return pair?.prefix ?? '';
  }

  constructor(uri: string, preferredPrefix: string | null = null) {
    this.uri = uri;

    const cached = XNamespace.namespaceCache.get(uri);
    if (cached) {
      if (cached.preferredPrefix !== preferredPrefix) {
        cached.preferredPrefix = preferredPrefix;
      }
      return cached.namespace;
    }

    XNamespace.namespaceCache.set(uri, new XNamespaceCacheEntry(this, preferredPrefix));
  }
}
