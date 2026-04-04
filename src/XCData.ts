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
 * Represents a CDATA section in an XML document.
 *
 * @remarks
 * Throws if the value contains `"]]>"`, which would prematurely close the CDATA section.
 *
 * @example
 * ```typescript
 * const cd = new XCData('<b>bold text & more</b>');
 * cd.toString(); // '<![CDATA[<b>bold text & more</b>]]>'
 * ```
 */
export class XCData extends XNode {
  /** The raw content of the CDATA section. */
  public readonly value: string;

  /**
   * Creates a new {@link XCData} from a string or by copying another {@link XCData}.
   *
   * @param value - The CDATA content. Must not contain `"]]>"`.
   * @throws Error if the value contains `"]]>"`.
   */
  constructor(value: string);
  constructor(other: XCData);
  constructor(valueOrOther: string | XCData) {
    super();
    this.nodeType = "CDATA";
    if (typeof valueOrOther === "string") {
      this.value = valueOrOther;
      if (this.value.includes("]]>")) {
        throw new Error(`XCData value must not contain ']]>': ${JSON.stringify(this.value)}`);
      }
    } else {
      this.value = valueOrOther.value;
    }
  }

  /**
   * Compares this CDATA section to another by value.
   *
   * @param other - The CDATA section to compare against.
   * @returns `true` if the values are equal.
   */
  public equals(other: XCData): boolean {
    return this.value === other.value;
  }

  /** @internal */
  public toStringInternal(): string {
    return `<![CDATA[${this.value}]]>`;
  }

  /**
   * Returns the XML serialization of this CDATA section, e.g. `<![CDATA[...]]>`.
   *
   * @returns The serialized CDATA string.
   */
  public toString(): string {
    return this.toStringInternal();
  }
}
