/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from './XNode.js';

export class XEntity extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XEntity);
  constructor(valueOrOther: string | XEntity) {
    super();
    this.nodeType = 'Entity';
    if (typeof valueOrOther === 'string') {
      this.value = valueOrOther;
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XEntity): boolean {
    return this.value === other.value;
  }

  public toStringInternal(): string {
    return `&${this.value};`;
  }

  public toString(): string {
    return this.toStringInternal();
  }
}
