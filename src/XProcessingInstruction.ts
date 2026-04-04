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
 * Represents an XML processing instruction (`<?target data?>`).
 *
 * @remarks
 * Throws if the target contains whitespace or if the target or data contains `"?>"`.
 *
 * @example
 * ```typescript
 * const pi = new XProcessingInstruction('xml-stylesheet', 'type="text/css" href="style.css"');
 * pi.toString(); // '<?xml-stylesheet type="text/css" href="style.css"?>'
 * ```
 */
export class XProcessingInstruction extends XNode {
  /** The target name of the processing instruction. */
  public readonly target: string;
  /** The data (body) of the processing instruction. */
  public readonly data: string;

  /**
   * Creates a new {@link XProcessingInstruction} from target/data strings or by copying another.
   *
   * @param target - The PI target. Must not contain whitespace or `"?>"`.
   * @param data - The PI data. Must not contain `"?>"`.
   * @throws Error if target contains whitespace or target/data contains `"?>"`.
   */
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

  /**
   * Compares this processing instruction to another by target and data.
   *
   * @param other - The processing instruction to compare against.
   * @returns `true` if both target and data are equal.
   */
  public equals(other: XProcessingInstruction): boolean {
    return this.target === other.target && this.data === other.data;
  }

  /** @internal */
  public toStringInternal(): string {
    return this.data.length > 0 ? `<?${this.target} ${this.data}?>` : `<?${this.target}?>`;
  }

  /**
   * Returns the XML serialization of this processing instruction.
   *
   * @returns The serialized PI string, e.g. `<?target data?>`.
   */
  public toString(): string {
    return this.toStringInternal();
  }
}
