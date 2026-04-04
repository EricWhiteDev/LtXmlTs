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

/**
 * Represents a text node inside an XML element.
 *
 * @remarks
 * Text content is automatically XML-escaped on serialization
 * (`&`, `<`, `>` become `&amp;`, `&lt;`, `&gt;`).
 *
 * @example
 * ```typescript
 * const t = new XText('Hello & World');
 * t.value; // 'Hello & World'
 * new XText('a < b & c > d').toString(); // 'a &lt; b &amp; c &gt; d'
 * ```
 *
 * @category Class and Type Reference
 */
export class XText extends XNode {
  /** The raw (unescaped) string content of this text node. */
  public readonly value: string;

  /**
   * Creates a new {@link XText} from a string value or by copying another {@link XText}.
   *
   * @param value - The text content.
   */
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

  /**
   * Compares this text node to another by value.
   *
   * @param other - The text node to compare against.
   * @returns `true` if the values are equal.
   */
  public equals(other: XText): boolean {
    return this.value === other.value;
  }

  /** @internal */
  public toStringInternal(): string {
    return xmlEscapeText(this.value);
  }

  /**
   * Returns the XML-escaped text content.
   *
   * @returns The serialized text with XML entities escaped.
   */
  public toString(): string {
    return this.toStringInternal();
  }
}
