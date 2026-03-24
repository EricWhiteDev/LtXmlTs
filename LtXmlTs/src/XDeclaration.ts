/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { xmlEscapeAttrValue } from './XmlUtils.js';

export class XDeclaration {
  public readonly version: string;
  public readonly encoding: string;
  public readonly standalone: string;

  constructor(version: string, encoding: string, standalone: string);
  constructor(other: XDeclaration);
  constructor(versionOrOther: string | XDeclaration, encoding?: string, standalone?: string) {
    if (typeof versionOrOther === 'string') {
      this.version = versionOrOther;
      this.encoding = encoding!;
      this.standalone = standalone!;
    } else {
      this.version = versionOrOther.version;
      this.encoding = versionOrOther.encoding;
      this.standalone = versionOrOther.standalone;
    }
  }

  public equals(other: XDeclaration): boolean {
    return this.version === other.version &&
      this.encoding === other.encoding &&
      this.standalone === other.standalone;
  }

  public toString(): string {
    let result = `<?xml version='${xmlEscapeAttrValue(this.version)}'`;
    if (this.encoding.length > 0) result += ` encoding='${xmlEscapeAttrValue(this.encoding)}'`;
    if (this.standalone.length > 0) result += ` standalone='${xmlEscapeAttrValue(this.standalone)}'`;
    result += '?>';
    return result;
  }
}
