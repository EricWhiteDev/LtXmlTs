/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from "./XNode.js";

export class XProcessingInstruction extends XNode {
  public readonly target: string;
  public readonly data: string;

  constructor(target: string, data: string);
  constructor(other: XProcessingInstruction);
  constructor(targetOrOther: string | XProcessingInstruction, data?: string) {
    super();
    this.nodeType = "ProcessingInstruction";
    if (typeof targetOrOther === "string") {
      this.target = targetOrOther;
      this.data = data!;
      if (/\s/.test(this.target)) {
        throw new Error(
          `XProcessingInstruction target must not contain whitespace: ${JSON.stringify(this.target)}`,
        );
      }
      if (this.target.includes("?>")) {
        throw new Error(
          `XProcessingInstruction target must not contain '?>': ${JSON.stringify(this.target)}`,
        );
      }
      if (this.data.includes("?>")) {
        throw new Error(
          `XProcessingInstruction data must not contain '?>': ${JSON.stringify(this.data)}`,
        );
      }
    } else {
      this.target = targetOrOther.target;
      this.data = targetOrOther.data;
    }
  }

  public equals(other: XProcessingInstruction): boolean {
    return this.target === other.target && this.data === other.data;
  }

  public toStringInternal(): string {
    return this.data.length > 0 ? `<?${this.target} ${this.data}?>` : `<?${this.target}?>`;
  }

  public toString(): string {
    return this.toStringInternal();
  }
}
