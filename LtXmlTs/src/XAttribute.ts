/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XObject } from './XObject.js';
import { XName } from './XName.js';
import { XNamespace } from './XNamespace.js';
import { XElement } from './XElement.js';
import { xmlEscapeAttrValue } from './XmlUtils.js';

export class XAttribute extends XObject {
  public readonly name: XName;
  public value: string;
  public pHashNamespace: boolean = false;

  public get isNamespaceDeclaration(): boolean {
    return this.name.namespace === XNamespace.xmlns;
  }

  constructor(name: XName | string);
  constructor(name: XName | string, content: unknown);
  constructor(other: XAttribute);
  constructor(nameOrOther: XName | XAttribute | string, content?: unknown) {
    super();
    this.nodeType = 'Attribute';
    if (nameOrOther instanceof XAttribute) {
      this.name = nameOrOther.name;
      this.value = nameOrOther.value;
      this.pHashNamespace = nameOrOther.pHashNamespace;
    } else {
      const name = typeof nameOrOther === 'string' ? new XName(nameOrOther) : nameOrOther;
      this.name = name;
      this.value = '';
      if (arguments.length >= 2) {
        if (content === null || content === undefined) {
          throw new Error('XAttribute content cannot be null or undefined');
        } else if (typeof content === 'string') {
          this.value = content;
        } else {
          this.value = (content as { toString(): string }).toString();
        }
      }
    }
  }

  public remove(): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as unknown as XElement).removeAttribute(this);
    this.parent = null;
  }

  public setValue(value: string): void {
    if (value === null || value === undefined) {
      throw new Error('XAttribute value cannot be null or undefined');
    }
    this.value = value;
  }

  public equals(other: XAttribute): boolean {
    return this.name.toString() === other.name.toString() && this.value === other.value;
  }

  public toStringInternal(): string {
    if (this.isNamespaceDeclaration) {
      if (this.name.localName === 'xmlns') {
        return `xmlns='${xmlEscapeAttrValue(this.value)}'`;
      }
      return `xmlns:${this.name.localName}='${xmlEscapeAttrValue(this.value)}'`;
    }
    return `${this.name.getPrefixedName(this)}='${xmlEscapeAttrValue(this.value)}'`;
  }

  public toString(): string {
    if (this.parent instanceof XElement) {
      XElement.populateNamespacePrefixInfo(this.parent);
    }
    try {
      return this.toStringInternal();
    } finally {
      if (this.parent instanceof XElement) {
        XElement.cleanupAfterSerialization(this.parent);
      }
    }
  }

  public get nextAttribute(): XAttribute | null {
    if (!(this.parent instanceof XElement)) return null;
    const attrs = (this.parent as XElement).attributes();
    const idx = attrs.indexOf(this);
    return idx < attrs.length - 1 ? attrs[idx + 1] : null;
  }

  public get previousAttribute(): XAttribute | null {
    if (!(this.parent instanceof XElement)) return null;
    const attrs = (this.parent as XElement).attributes();
    const idx = attrs.indexOf(this);
    return idx > 0 ? attrs[idx - 1] : null;
  }
}
