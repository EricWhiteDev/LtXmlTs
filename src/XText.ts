/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from "./XNode.js";
import { xmlEscapeText } from "./XmlUtils.js";

export class XText extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XText);
  constructor(valueOrOther: string | XText) {
    super();
    this.nodeType = "Text";
    if (typeof valueOrOther === "string") {
      this.value = valueOrOther;
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XText): boolean {
    return this.value === other.value;
  }

  public toStringInternal(): string {
    return xmlEscapeText(this.value);
  }

  public toString(): string {
    return this.toStringInternal();
  }
}
