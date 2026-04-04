/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import type { XNamespace } from "./XNamespace.js";

/**
 * A simple data class that binds an {@link XNamespace} to its serialization prefix.
 *
 * @category Class and Type Reference
 */
export class NamespacePrefixPair {
  /** The namespace. */
  public readonly namespace: XNamespace;
  /** The prefix string used during serialization. */
  public prefix: string;

  /**
   * @param namespace - The namespace to bind.
   * @param prefix - The prefix string.
   */
  constructor(namespace: XNamespace, prefix: string) {
    this.namespace = namespace;
    this.prefix = prefix;
  }
}

/**
 * Holds namespace-prefix scope information used during serialization.
 *
 * @category Class and Type Reference
 */
export class NamespacePrefixInfo {
  /** @internal */
  public static pHashCount: number = 0;
  /** The default namespace in this scope. */
  public defaultNamespace: XNamespace;
  /** The list of namespace-to-prefix bindings in this scope. */
  public readonly namespacePrefixPairs: NamespacePrefixPair[];

  /**
   * Creates a new {@link NamespacePrefixInfo} from explicit values or by copying another.
   *
   * @param defaultNamespace - The default namespace for the scope.
   * @param namespacePrefixPairs - The prefix bindings.
   */
  constructor(defaultNamespace: XNamespace, namespacePrefixPairs: NamespacePrefixPair[]);
  constructor(other: NamespacePrefixInfo);
  constructor(
    defaultNamespaceOrOther: XNamespace | NamespacePrefixInfo,
    namespacePrefixPairs?: NamespacePrefixPair[],
  ) {
    if (defaultNamespaceOrOther instanceof NamespacePrefixInfo) {
      this.defaultNamespace = defaultNamespaceOrOther.defaultNamespace;
      this.namespacePrefixPairs = defaultNamespaceOrOther.namespacePrefixPairs.map(
        (p) => new NamespacePrefixPair(p.namespace, p.prefix),
      );
    } else {
      this.defaultNamespace = defaultNamespaceOrOther;
      this.namespacePrefixPairs = namespacePrefixPairs!;
    }
  }
}
