/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNamespace } from "./XNamespace.js";
import type { XObject } from "./XObject.js";

class XNameCacheEntry {
  name: XName;

  constructor(name: XName) {
    this.name = name;
  }
}

/**
 * An immutable, interned representation of an XML qualified name.
 *
 * @remarks
 * {@link XName} instances are cached: two instances for the same namespace and local
 * name are the same object (identity equality). Supports Clark notation:
 * `{http://example.com/ns}localName`.
 *
 * @example
 * ```typescript
 * const n1 = XName.get('title');
 * const n2 = XName.get('title');
 * n1 === n2; // true -- same cached instance
 *
 * XName.get('{urn:example}item').localName; // 'item'
 * XName.get('{urn:example}item').namespaceName; // 'urn:example'
 * ```
 *
 * @category Class and Type Reference
 */
export class XName {
  private static nameCache: Map<string, XNameCacheEntry> = new Map();

  /** The namespace of this name. */
  public readonly namespace: XNamespace;
  /** The local (unqualified) part of this name. */
  public readonly localName: string;

  /**
   * Returns the namespace URI string of this name.
   */
  public get namespaceName(): string {
    return this.namespace.uri;
  }

  /**
   * Returns a cached {@link XName} for the given namespace and local name, or
   * parses a Clark-notation string.
   *
   * @param namespace - The namespace, or a string in Clark notation.
   * @param localName - The local name (when providing an explicit namespace).
   * @returns The cached {@link XName} instance.
   */
  public static get(namespace: XNamespace, localName: string): XName;
  public static get(name: string): XName;
  public static get(namespaceOrName: XNamespace | string, localName?: string): XName {
    if (namespaceOrName instanceof XNamespace) {
      return new XName(namespaceOrName, localName!);
    }
    return new XName(namespaceOrName);
  }

  /**
   * Creates (or retrieves from cache) an {@link XName}.
   *
   * @remarks
   * Because names are interned, calling `new XName('foo')` twice returns the
   * same object.
   *
   * @param namespace - The namespace, or a Clark-notation string.
   * @param localName - The local name (when providing an explicit namespace).
   */
  constructor(namespace: XNamespace, localName: string);
  constructor(name: string);
  constructor(namespaceOrName: XNamespace | string, localName?: string) {
    let ns: XNamespace;
    let local: string;

    if (namespaceOrName instanceof XNamespace) {
      ns = namespaceOrName;
      local = localName!;
    } else {
      const name = namespaceOrName;
      if (name.startsWith("{")) {
        const closeIdx = name.indexOf("}");
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

    const clarkKey = ns.uri === "" ? local : `{${ns.uri}}${local}`;
    const cached = XName.nameCache.get(clarkKey);
    if (cached) {
      return cached.name;
    }

    XName.nameCache.set(clarkKey, new XNameCacheEntry(this));
  }

  /**
   * Returns the Clark-notation string for this name, or just the local name
   * when the namespace is empty.
   *
   * @returns The string representation, e.g. `"{urn:example}item"` or `"item"`.
   */
  public toString(): string {
    return this.namespace.uri === "" ? this.localName : `{${this.namespace.uri}}${this.localName}`;
  }

  /**
   * Compares this name to another by identity (interned reference equality).
   *
   * @param other - The name to compare against.
   * @returns `true` if both names are the same interned instance.
   */
  public equals(other: XName): boolean {
    return this === other;
  }

  /**
   * Returns the prefixed form of this name for serialization.
   * @internal
   */
  public getPrefixedName(contextObject: XObject): string {
    if (this.namespace === XNamespace.none) {
      return this.localName;
    }
    const prefix = this.namespace.getPrefix(contextObject);
    if (prefix === "") {
      return this.localName;
    }
    return `${prefix}:${this.localName}`;
  }
}
