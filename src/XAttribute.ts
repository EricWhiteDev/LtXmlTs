/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XObject } from "./XObject.js";
import { XName } from "./XName.js";
import { XNamespace } from "./XNamespace.js";
import { XElement } from "./XElement.js";
import { xmlEscapeAttrValue } from "./XmlUtils.js";

/**
 * Represents an XML attribute on an element.
 *
 * @remarks
 * Attributes are not nodes in the {@link XNode} sense -- they do not appear in
 * {@link XContainer.nodes | nodes()} or {@link XElement.descendants | descendants()}
 * results -- but they inherit from {@link XObject} and carry the same parent
 * reference and annotation API.
 *
 * @example
 * ```typescript
 * const a = new XAttribute('id', '42');
 * a.name.localName; // 'id'
 * a.value; // '42'
 * ```
 *
 * @category Class and Type Reference
 */
export class XAttribute extends XObject {
  /** The fully-qualified name of this attribute. */
  public readonly name: XName;
  /** The string value of this attribute. */
  public value: string;
  /** @internal */
  public pHashNamespace: boolean = false;

  /**
   * Indicates whether this attribute is a namespace declaration (`xmlns` or `xmlns:prefix`).
   *
   * @example
   * ```typescript
   * new XAttribute(XNamespace.xmlns + 'w', 'http://...').isNamespaceDeclaration; // true
   * ```
   */
  public get isNamespaceDeclaration(): boolean {
    return this.name.namespace === XNamespace.xmlns;
  }

  /**
   * Creates a new {@link XAttribute} with the given name and an empty-string value.
   *
   * @remarks
   * Accepts either a name and value, a name alone (empty-string value), or an
   * existing {@link XAttribute} to copy.
   *
   * @param name - The qualified name of the attribute.
   *
   * @example
   * ```typescript
   * const a = new XAttribute('id', '42');
   * const copy = new XAttribute(a);
   * ```
   */
  constructor(name: XName | string);
  /**
   * Creates a new {@link XAttribute} with the given name and value.
   *
   * @param name - The qualified name of the attribute.
   * @param content - The value, converted to a string via `toString()`.
   */
  constructor(name: XName | string, content: unknown);
  /**
   * Creates a new {@link XAttribute} by copying an existing one.
   *
   * @param other - The attribute to copy.
   */
  constructor(other: XAttribute);
  constructor(nameOrOther: XName | XAttribute | string, content?: unknown) {
    super();
    this.nodeType = "Attribute";
    if (nameOrOther instanceof XAttribute) {
      this.name = nameOrOther.name;
      this.value = nameOrOther.value;
      this.pHashNamespace = nameOrOther.pHashNamespace;
    } else {
      const name = typeof nameOrOther === "string" ? new XName(nameOrOther) : nameOrOther;
      this.name = name;
      this.value = "";
      if (arguments.length >= 2) {
        if (content === null || content === undefined) {
          throw new Error("XAttribute content cannot be null or undefined");
        } else if (typeof content === "string") {
          this.value = content;
        } else {
          this.value = (content as { toString(): string }).toString();
        }
      }
    }
  }

  /**
   * Removes this attribute from its parent element.
   *
   * @throws Error if the attribute has no parent.
   */
  public remove(): void {
    if (this.parent === null) {
      throw new Error("The parent is missing.");
    }
    (this.parent as unknown as XElement).removeAttribute(this);
    this.parent = null;
  }

  /**
   * Sets the value of this attribute.
   *
   * @param value - The new string value. Must not be `null` or `undefined`.
   * @throws Error if `value` is `null` or `undefined`.
   */
  public setValue(value: string): void {
    if (value === null || value === undefined) {
      throw new Error("XAttribute value cannot be null or undefined");
    }
    this.value = value;
  }

  /**
   * Compares this attribute to another by name and value.
   *
   * @param other - The attribute to compare against.
   * @returns `true` if both name and value are equal.
   */
  public equals(other: XAttribute): boolean {
    return this.name.toString() === other.name.toString() && this.value === other.value;
  }

  /** @internal */
  public toStringInternal(): string {
    if (this.isNamespaceDeclaration) {
      if (this.name.localName === "xmlns") {
        return `xmlns='${xmlEscapeAttrValue(this.value)}'`;
      }
      return `xmlns:${this.name.localName}='${xmlEscapeAttrValue(this.value)}'`;
    }
    return `${this.name.getPrefixedName(this)}='${xmlEscapeAttrValue(this.value)}'`;
  }

  /**
   * Returns the XML serialization of this attribute, e.g. `name='value'`.
   *
   * @returns The serialized attribute string with XML-escaped value.
   */
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

  /**
   * Returns the next sibling attribute on the parent element, or `null`.
   *
   * @example
   * ```typescript
   * const el = new XElement('a', new XAttribute('x','1'), new XAttribute('y','2'));
   * el.firstAttribute?.nextAttribute?.name.localName; // 'y'
   * ```
   */
  public get nextAttribute(): XAttribute | null {
    if (!(this.parent instanceof XElement)) {
      return null;
    }
    const attrs = (this.parent as XElement).attributes();
    const idx = attrs.indexOf(this);
    return idx < attrs.length - 1 ? attrs[idx + 1] : null;
  }

  /**
   * Returns the previous sibling attribute on the parent element, or `null`.
   */
  public get previousAttribute(): XAttribute | null {
    if (!(this.parent instanceof XElement)) {
      return null;
    }
    const attrs = (this.parent as XElement).attributes();
    const idx = attrs.indexOf(this);
    return idx > 0 ? attrs[idx - 1] : null;
  }
}
