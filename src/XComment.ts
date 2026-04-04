/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from "./XNode.js";

/**
 * Represents an XML comment node (`<!-- ... -->`).
 *
 * @remarks
 * Throws if the content contains `"--"`, which is invalid inside an XML comment.
 *
 * @example
 * ```typescript
 * const c = new XComment(' this is a comment ');
 * c.toString(); // '<!-- this is a comment -->'
 * c.value; // ' this is a comment '
 * ```
 *
 * @category Class and Type Reference
 */
export class XComment extends XNode {
  /** The text content of the comment (without the `<!--` / `-->` delimiters). */
  public readonly value: string;

  /**
   * Creates a new {@link XComment} from a string or by copying another {@link XComment}.
   *
   * @param content - The comment text. Must not contain `"--"`.
   * @throws Error if the content contains `"--"`.
   */
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

  /**
   * Compares this comment to another by value.
   *
   * @param other - The comment to compare against.
   * @returns `true` if the values are equal.
   */
  public equals(other: XComment): boolean {
    return this.value === other.value;
  }

  /** @internal */
  public toStringInternal(): string {
    return `<!--${this.value}-->`;
  }

  /**
   * Returns the XML serialization of this comment, e.g. `<!-- text -->`.
   *
   * @returns The serialized comment string.
   */
  public toString(): string {
    return this.toStringInternal();
  }
}
