/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { xmlEscapeAttrValue } from "./XmlUtils.js";

/**
 * Represents the XML declaration (`<?xml ...?>`).
 *
 * @remarks
 * {@link XDeclaration} is not a node; it is held by {@link XDocument} and serialized
 * at the beginning of the document output.
 *
 * @example
 * ```typescript
 * const decl = new XDeclaration('1.0', 'UTF-8', 'yes');
 * decl.toString(); // "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>"
 * ```
 *
 * @category Class and Type Reference
 */
export class XDeclaration {
  /** The XML version, typically `"1.0"`. */
  public readonly version: string;
  /** The character encoding, e.g. `"UTF-8"`. Empty string if omitted. */
  public readonly encoding: string;
  /** The standalone flag (`"yes"` or `"no"`). Empty string if omitted. */
  public readonly standalone: string;

  /**
   * Creates a new {@link XDeclaration} from explicit values or by copying another.
   *
   * @param version - The XML version string.
   * @param encoding - The encoding name (pass `""` to omit).
   * @param standalone - The standalone value (pass `""` to omit).
   */
  constructor(version: string, encoding: string, standalone: string);
  constructor(other: XDeclaration);
  constructor(versionOrOther: string | XDeclaration, encoding?: string, standalone?: string) {
    if (typeof versionOrOther === "string") {
      this.version = versionOrOther;
      this.encoding = encoding!;
      this.standalone = standalone!;
    } else {
      this.version = versionOrOther.version;
      this.encoding = versionOrOther.encoding;
      this.standalone = versionOrOther.standalone;
    }
  }

  /**
   * Compares this declaration to another by version, encoding, and standalone.
   *
   * @param other - The declaration to compare against.
   * @returns `true` if all three fields are equal.
   */
  public equals(other: XDeclaration): boolean {
    return (
      this.version === other.version &&
      this.encoding === other.encoding &&
      this.standalone === other.standalone
    );
  }

  /**
   * Returns the XML declaration string, e.g. `<?xml version='1.0' encoding='UTF-8'?>`.
   *
   * @returns The serialized XML declaration.
   */
  public toString(): string {
    let result = `<?xml version='${xmlEscapeAttrValue(this.version)}'`;
    if (this.encoding.length > 0) {
      result += ` encoding='${xmlEscapeAttrValue(this.encoding)}'`;
    }
    if (this.standalone.length > 0) {
      result += ` standalone='${xmlEscapeAttrValue(this.standalone)}'`;
    }
    result += "?>";
    return result;
  }
}
