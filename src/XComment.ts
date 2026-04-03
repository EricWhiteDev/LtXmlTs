/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from "./XNode.js";

export class XComment extends XNode {
  public readonly value: string;

  constructor(content: string);
  constructor(other: XComment);
  constructor(contentOrOther: string | XComment) {
    super();
    this.nodeType = "Comment";
    if (typeof contentOrOther === "string") {
      this.value = contentOrOther;
      if (this.value.includes("--")) {
        throw new Error(`XComment value must not contain '--': ${JSON.stringify(this.value)}`);
      }
    } else {
      this.value = contentOrOther.value;
    }
  }

  public equals(other: XComment): boolean {
    return this.value === other.value;
  }

  public toStringInternal(): string {
    return `<!--${this.value}-->`;
  }

  public toString(): string {
    return this.toStringInternal();
  }
}
