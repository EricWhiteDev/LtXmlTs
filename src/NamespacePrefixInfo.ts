/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import type { XNamespace } from "./XNamespace.js";

export class NamespacePrefixPair {
  public readonly namespace: XNamespace;
  public prefix: string;

  constructor(namespace: XNamespace, prefix: string) {
    this.namespace = namespace;
    this.prefix = prefix;
  }
}

export class NamespacePrefixInfo {
  public static pHashCount: number = 0;
  public defaultNamespace: XNamespace;
  public readonly namespacePrefixPairs: NamespacePrefixPair[];

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
