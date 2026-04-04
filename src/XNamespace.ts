/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XName } from "./XName.js";
import type { XObject } from "./XObject.js";
import type { NamespacePrefixInfo, NamespacePrefixPair } from "./NamespacePrefixInfo.js";

class XNamespaceCacheEntry {
  namespace: XNamespace;
  preferredPrefix: string | null;

  constructor(namespace: XNamespace, preferredPrefix: string | null) {
    this.namespace = namespace;
    this.preferredPrefix = preferredPrefix;
  }
}

/**
 * Represents an XML namespace URI.
 *
 * @remarks
 * Like {@link XName}, namespace instances are cached/interned: two
 * {@link XNamespace} objects for the same URI are the same object.
 *
 * Three well-known static namespaces are provided: {@link XNamespace.none},
 * {@link XNamespace.xml}, and {@link XNamespace.xmlns}.
 *
 * The {@link toString} method returns `{uri}`, which enables Clark-notation via
 * string concatenation: `XNamespace.get(uri) + "localName"` evaluates to
 * `"{uri}localName"`.
 *
 * @example
 * ```typescript
 * const W = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');
 * const wBody = W.getName('body');
 * // Clark notation via string concatenation:
 * const name = W + 'body'; // '{http://...}body'
 * ```
 *
 * @category Class and Type Reference
 */
export class XNamespace {
  private static namespaceCache: Map<string, XNamespaceCacheEntry> = new Map();

  /** The empty namespace (no namespace). */
  public static readonly none: XNamespace = new XNamespace("");
  /** The `http://www.w3.org/XML/1998/namespace` namespace (`xml` prefix). */
  public static readonly xml: XNamespace = new XNamespace(
    "http://www.w3.org/XML/1998/namespace",
    "xml",
  );
  /** The `http://www.w3.org/2000/xmlns/` namespace (`xmlns` prefix). */
  public static readonly xmlns: XNamespace = new XNamespace(
    "http://www.w3.org/2000/xmlns/",
    "xmlns",
  );

  /** The namespace URI string. */
  public readonly uri: string;

  /**
   * Returns the preferred serialization prefix for this namespace, or `null`
   * if none has been set.
   */
  public get preferredPrefix(): string | null {
    return XNamespace.namespaceCache.get(this.uri)?.preferredPrefix ?? null;
  }

  /**
   * Alias for {@link uri}. Returns the namespace URI string.
   */
  public get namespaceName(): string {
    return this.uri;
  }

  /**
   * Returns a cached {@link XNamespace} for the given URI.
   *
   * @param uri - The namespace URI string.
   * @returns The cached {@link XNamespace} instance.
   */
  public static get(uri: string): XNamespace {
    return new XNamespace(uri);
  }

  /**
   * Returns the empty (no-namespace) {@link XNamespace}.
   */
  public static getNone(): XNamespace {
    return new XNamespace("");
  }

  /**
   * Returns the `xml` namespace (`http://www.w3.org/XML/1998/namespace`).
   */
  public static getXml(): XNamespace {
    return new XNamespace("http://www.w3.org/XML/1998/namespace", "xml");
  }

  /**
   * Returns the `xmlns` namespace (`http://www.w3.org/2000/xmlns/`).
   */
  public static getXmlns(): XNamespace {
    return new XNamespace("http://www.w3.org/2000/xmlns/", "xmlns");
  }

  /**
   * Returns the namespace URI wrapped in braces (`{uri}`), enabling
   * Clark-notation via string concatenation.
   *
   * @returns `"{uri}"` or `""` for the empty namespace.
   */
  public toString(): string {
    return this.uri === "" ? "" : `{${this.uri}}`;
  }

  /**
   * Returns an {@link XName} in this namespace with the given local name.
   *
   * @param localName - The local part of the qualified name.
   * @returns The cached {@link XName} instance.
   */
  public getName(localName: string): XName {
    return new XName(this, localName);
  }

  /**
   * Compares this namespace to another by identity (interned reference equality).
   *
   * @param other - The namespace to compare against.
   * @returns `true` if both are the same interned instance.
   */
  public equals(other: XNamespace): boolean {
    return this === other;
  }

  /**
   * Resolves the serialization prefix for this namespace within the given context.
   * @internal
   */
  public getPrefix(contextObject: XObject): string {
    if (contextObject.nodeType === "Attribute") {
      const attrName = (contextObject as unknown as { name: XName }).name;
      if (attrName.namespace === XNamespace.none) {
        return "";
      }
      contextObject = contextObject.parent as XObject;
      if (contextObject === null) {
        return "";
      }
    }
    const info = contextObject.namespacePrefixInfo as NamespacePrefixInfo | null;
    if (info === null) {
      return "";
    }
    const pair = info.namespacePrefixPairs.find((p: NamespacePrefixPair) => p.namespace === this);
    return pair?.prefix ?? "";
  }

  /**
   * Creates (or retrieves from cache) an {@link XNamespace} for the given URI.
   *
   * @param uri - The namespace URI string.
   * @param preferredPrefix - Optional preferred prefix for serialization.
   */
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
