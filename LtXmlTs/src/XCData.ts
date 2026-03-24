/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from './XNode.js';

export class XCData extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XCData);
  constructor(valueOrOther: string | XCData) {
    super();
    this.nodeType = 'CDATA';
    if (typeof valueOrOther === 'string') {
      this.value = valueOrOther;
      if (this.value.includes(']]>')) {
        throw new Error(`XCData value must not contain ']]>': ${JSON.stringify(this.value)}`);
      }
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XCData): boolean {
    return this.value === other.value;
  }

  public toStringInternal(): string {
    return `<![CDATA[${this.value}]]>`;
  }

  public toString(): string {
    return this.toStringInternal();
  }
}
