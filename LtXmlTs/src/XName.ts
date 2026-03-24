/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNamespace } from './XNamespace.js';
import type { XObject } from './XObject.js';

class XNameCacheEntry {
  name: XName;

  constructor(name: XName) {
    this.name = name;
  }
}

export class XName {
  private static nameCache: Map<string, XNameCacheEntry> = new Map();

  public readonly namespace: XNamespace;
  public readonly localName: string;

  public get namespaceName(): string {
    return this.namespace.uri;
  }

  public static get(namespace: XNamespace, localName: string): XName
  public static get(name: string): XName
  public static get(namespaceOrName: XNamespace | string, localName?: string): XName {
    if (namespaceOrName instanceof XNamespace) {
      return new XName(namespaceOrName, localName!);
    }
    return new XName(namespaceOrName);
  }

  constructor(namespace: XNamespace, localName: string)
  constructor(name: string)
  constructor(namespaceOrName: XNamespace | string, localName?: string) {
    let ns: XNamespace;
    let local: string;

    if (namespaceOrName instanceof XNamespace) {
      ns = namespaceOrName;
      local = localName!;
    } else {
      const name = namespaceOrName;
      if (name.startsWith('{')) {
        const closeIdx = name.indexOf('}');
        if (closeIdx === -1) {
          throw new Error(`Invalid clark notation name: '${name}'`);
        }
        ns = new XNamespace(name.slice(1, closeIdx));
        local = name.slice(closeIdx + 1);
      } else {
        ns = XNamespace.none;
        local = name;
      }
    }

    this.namespace = ns;
    this.localName = local;

    const clarkKey = ns.uri === '' ? local : `{${ns.uri}}${local}`;
    const cached = XName.nameCache.get(clarkKey);
    if (cached) {
      return cached.name;
    }

    XName.nameCache.set(clarkKey, new XNameCacheEntry(this));
  }

  public toString(): string {
    return this.namespace.uri === '' ? this.localName : `{${this.namespace.uri}}${this.localName}`;
  }

  public equals(other: XName): boolean {
    return this === other;
  }

  public getPrefixedName(contextObject: XObject): string {
    if (this.namespace === XNamespace.none) return this.localName;
    const prefix = this.namespace.getPrefix(contextObject);
    if (prefix === '') return this.localName;
    return `${prefix}:${this.localName}`;
  }
}
