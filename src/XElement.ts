/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XContainer } from "./XContainer.js";
import { XName } from "./XName.js";
import { XAttribute } from "./XAttribute.js";
import { XNamespace } from "./XNamespace.js";
import { NamespacePrefixInfo, NamespacePrefixPair } from "./NamespacePrefixInfo.js";
import { XComment } from "./XComment.js";
import { XText } from "./XText.js";
import { XCData } from "./XCData.js";
import { XProcessingInstruction } from "./XProcessingInstruction.js";
import { XNode } from "./XNode.js";
import { indentXml } from "./XmlUtils.js";
import { SaxParser } from "./SaxParser.js";

/**
 * Represents an XML element -- the primary class in LtXmlTs.
 *
 * @remarks
 * An `XElement` has a {@link XName | name}, zero or more {@link XAttribute | attributes},
 * and zero or more child nodes. It supports functional construction (passing
 * children and attributes to the constructor), parsing from strings or files,
 * and serialisation to XML strings.
 *
 * @example
 * ```typescript
 * const el = new XElement('item',
 *   new XAttribute('id', '1'),
 *   new XElement('name', 'Widget'),
 * );
 * const copy = new XElement(el); // clone
 * ```
 *
 * @category Class and Type Reference
 */
export class XElement extends XContainer {
  /**
   * The qualified name of this element.
   */
  public readonly name: XName;
  private attributesArray: XAttribute[] = [];

  /**
   * Gets the concatenated text content of this element and all its descendants.
   *
   * @remarks
   * The setter replaces all child nodes with a single {@link XText} node.
   *
   * @example
   * ```typescript
   * const el = new XElement('title', 'Hello ', new XElement('em', 'World'));
   * el.value; // 'Hello World'
   * el.value = 'New text';
   * ```
   */
  public get value(): string {
    return this.descendantNodes()
      .filter((n): n is XText => n instanceof XText)
      .map((n) => n.value)
      .join("");
  }

  public set value(value: string) {
    this.removeNodes();
    this.addContentList(new XText(value));
  }

  /**
   * Returns the attributes of this element.
   *
   * @returns An array of {@link XAttribute} instances.
   */
  public attributes(): XAttribute[];
  /**
   * Returns the attributes of this element filtered by name.
   *
   * @param name - Name to filter by.
   */
  public attributes(name: XName | string): XAttribute[];
  public attributes(name?: XName | string): XAttribute[] {
    const xname =
      name === undefined ? undefined : typeof name === "string" ? new XName(name) : name;
    return this.attributesArray.filter((a) => xname === undefined || a.name === xname);
  }

  /**
   * Returns the attribute with the specified name, or `null`.
   *
   * @param name - The attribute name to look up.
   * @returns The matching {@link XAttribute}, or `null`.
   */
  public attribute(name: XName | string): XAttribute | null {
    const xname = typeof name === "string" ? new XName(name) : name;
    return this.attributesArray.find((a) => a.name === xname) ?? null;
  }

  /**
   * Gets the first attribute of this element, or `null` if there are none.
   */
  public get firstAttribute(): XAttribute | null {
    return this.attributesArray.length > 0 ? this.attributesArray[0] : null;
  }

  /**
   * Gets the last attribute of this element, or `null` if there are none.
   */
  public get lastAttribute(): XAttribute | null {
    return this.attributesArray.length > 0
      ? this.attributesArray[this.attributesArray.length - 1]
      : null;
  }

  /**
   * Returns `true` if this element has at least one attribute.
   */
  public get hasAttributes(): boolean {
    return this.attributesArray.length > 0;
  }

  /**
   * Returns this element followed by all its descendant nodes in document order.
   *
   * @returns An array starting with this element and including all descendant nodes.
   */
  public descendantNodesAndSelf(): XNode[] {
    const tempArray: XNode[] = [];
    tempArray.push(this);
    for (const node of this.nodesArray) {
      this.addSelfAndDescendantsToTempArray(tempArray, node);
    }
    return tempArray;
  }

  /**
   * Returns this element followed by all its descendant elements in document order.
   *
   * @returns An array starting with this element (if it matches) and including
   *   all matching descendant elements.
   */
  public descendantsAndSelf(): XElement[];
  /**
   * Returns this element followed by all its descendant elements in document order, filtered by name.
   *
   * @param name - Name to filter by.
   */
  public descendantsAndSelf(name: XName | string): XElement[];
  public descendantsAndSelf(name?: XName | string): XElement[] {
    const tempArray: XElement[] = [];
    const xname = name === undefined ? null : typeof name === "string" ? new XName(name) : name;
    this.addSelfAndDescendantsElementsToTempArray(tempArray, this, xname);
    return tempArray;
  }

  /**
   * Returns `true` if this element contains at least one child element.
   */
  public get hasElements(): boolean {
    return this.nodesArray.some((n) => n instanceof XElement);
  }

  /**
   * Returns `true` if this element has no child nodes.
   */
  public get isEmpty(): boolean {
    return this.nodesArray.length === 0;
  }

  /**
   * Adds multiple attribute content items.
   * @internal
   */
  protected addAttributeContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addAttributeContentObject(item);
    }
  }

  /**
   * Removes a specific attribute from this element.
   *
   * @param attr - The attribute instance to remove.
   */
  public removeAttribute(attr: XAttribute): void {
    const idx = this.attributesArray.indexOf(attr);
    this.attributesArray = [
      ...this.attributesArray.slice(0, idx),
      ...this.attributesArray.slice(idx + 1),
    ];
    attr.parent = null;
  }

  /**
   * Removes all attributes from this element.
   */
  public removeAttributes(): void {
    for (const attr of this.attributesArray) {
      attr.parent = null;
    }
    this.attributesArray = [];
  }

  /**
   * Replaces all attributes on this element with the specified content.
   *
   * @param content - New attributes (or arrays of attributes) to set.
   */
  public replaceAttributes(...content: unknown[]): void {
    this.removeAttributes();
    this.addAttributeContentList(...content);
  }

  /**
   * Sets, updates, or removes an attribute by name.
   *
   * @remarks
   * If `value` is `null`, the attribute is removed (if it exists). Otherwise
   * the attribute is created or updated with the new value.
   *
   * @param name - The attribute name.
   * @param value - The new value, or `null` to remove.
   *
   * @example
   * ```typescript
   * el.setAttributeValue('id', '42');   // add or update
   * el.setAttributeValue('id', null);   // remove
   * ```
   */
  public setAttributeValue(name: XName | string, value: string | null): void {
    const existing = this.attribute(name);
    if (value === null) {
      if (existing !== null) {
        this.removeAttribute(existing);
      }
    } else if (existing !== null) {
      existing.value = value;
    } else {
      this.addAttributeContentList(new XAttribute(name, value));
    }
  }

  /**
   * Sets, updates, or removes a child element by name.
   *
   * @remarks
   * If `value` is `null`, the matching child element is removed. If the child
   * exists, its content is replaced. Otherwise a new child element is created.
   *
   * @param name - The child element name.
   * @param value - The new text value, or `null` to remove.
   */
  public setElementValue(name: XName | string, value: string | null): void {
    const existing = this.element(name);
    if (value === null) {
      if (existing !== null) {
        existing.remove();
      }
    } else if (existing !== null) {
      existing.removeNodes();
      existing.addContentList(new XText(value));
    } else {
      this.addContentList(new XElement(name, new XText(value)));
    }
  }

  /**
   * Removes all attributes and child nodes from this element.
   */
  public removeAll(): void {
    for (const attr of this.attributesArray) {
      attr.parent = null;
    }
    this.attributesArray = [];
    this.removeNodes();
  }

  /**
   * Replaces all attributes and child nodes with the specified content.
   *
   * @param content - New content (nodes, attributes, strings, or arrays).
   */
  public replaceAll(...content: unknown[]): void {
    this.removeAll();
    this.addContentList(...content);
    this.addAttributeContentList(...content);
  }

  /**
   * Adds a single attribute content object, cloning if it already has a parent.
   * @internal
   */
  protected addAttributeContentObject(content: unknown): void {
    if (content === null || content === undefined) {
      return;
    }
    if (!(content instanceof XAttribute)) {
      return;
    }
    if (content.parent !== null) {
      const clone = new XAttribute(content);
      clone.parent = this;
      this.attributesArray.push(clone);
    } else {
      content.parent = this;
      this.attributesArray.push(content);
    }
  }

  /**
   * Creates an empty XElement with the given name.
   *
   * @remarks
   * - `new XElement(name)` creates an empty element.
   * - `new XElement(name, ...content)` creates an element with child nodes
   *   and/or attributes via functional construction.
   * - `new XElement(other)` deep-clones an existing element.
   *
   * @param name - The element name (string or {@link XName}).
   *
   * @example
   * ```typescript
   * const el = new XElement('item',
   *   new XAttribute('id', '1'),
   *   new XElement('name', 'Widget'),
   * );
   * const copy = new XElement(el); // clone
   * ```
   */
  constructor(name: XName | string);
  /**
   * Creates an XElement with the given name and content.
   *
   * @param name - The element name (string or {@link XName}).
   * @param content - Child nodes, attributes, strings, or arrays thereof.
   */
  constructor(name: XName | string, ...content: unknown[]);
  /**
   * Deep-clones an existing XElement.
   *
   * @param other - The element to clone.
   */
  constructor(other: XElement);
  constructor(nameOrOther: XName | XElement | string, ...content: unknown[]) {
    super();
    this.nodeType = "Element";
    if (nameOrOther instanceof XElement) {
      const other = nameOrOther;
      this.name = other.name;
      for (const attr of other.attributesArray) {
        const clone = new XAttribute(attr);
        clone.parent = this;
        this.attributesArray.push(clone);
      }
      for (const node of other.nodesArray) {
        let clonedNode: XNode;
        if (node instanceof XElement) {
          clonedNode = new XElement(node);
        } else if (node instanceof XComment) {
          clonedNode = new XComment(node);
        } else if (node instanceof XText) {
          clonedNode = new XText(node);
        } else if (node instanceof XCData) {
          clonedNode = new XCData(node);
        } else if (node instanceof XProcessingInstruction) {
          clonedNode = new XProcessingInstruction(node);
        } else {
          continue;
        }
        clonedNode.parent = this;
        this.nodesArray.push(clonedNode);
      }
    } else {
      const name = typeof nameOrOther === "string" ? new XName(nameOrOther) : nameOrOther;
      this.name = name;
      this.addContentList(...content);
      this.addAttributeContentList(...content);
    }
  }

  /**
   * Returns this element followed by all its ancestor elements.
   *
   * @returns An array starting with this element and continuing to the root.
   */
  public ancestorsAndSelf(): XElement[];
  /**
   * Returns this element followed by all its ancestor elements, filtered by name.
   *
   * @param name - Name to filter by.
   */
  public ancestorsAndSelf(name: XName | string): XElement[];
  public ancestorsAndSelf(name?: XName | string): XElement[] {
    const result: XElement[] = [this];
    let current = this.parent;
    while (current !== null && current.nodeType === "Element") {
      result.push(current as unknown as XElement);
      current = current.parent;
    }
    if (name === undefined) {
      return result;
    }
    const xname = typeof name === "string" ? new XName(name) : name;
    return result.filter((e) => e.name === xname);
  }

  /**
   * Compares this element with another for structural equality, including
   * name, attributes, and all child nodes.
   *
   * @param other - The element to compare against.
   * @returns `true` if the elements are structurally identical.
   */
  public override equals(other: XElement): boolean {
    if (!this.name.equals(other.name)) {
      return false;
    }
    if (this.attributesArray.length !== other.attributesArray.length) {
      return false;
    }
    for (let i = 0; i < this.attributesArray.length; i++) {
      if (!this.attributesArray[i].equals(other.attributesArray[i])) {
        return false;
      }
    }
    return super.equals(other);
  }

  /**
   * Produces the XML string for this element (used by the serialisation pipeline).
   * @internal
   */
  public toStringInternal(): string {
    const prefixedName = this.name.getPrefixedName(this);
    const attrs = this.attributesArray.map((a) => a.toStringInternal()).join(" ");
    const attrsStr = attrs.length > 0 ? " " + attrs : "";

    if (this.nodesArray.length === 0) {
      return `<${prefixedName}${attrsStr} />`;
    }

    const content = this.nodesArray.map((n) => n.toStringInternal()).join("");
    return `<${prefixedName}${attrsStr}>${content}</${prefixedName}>`;
  }

  /**
   * Serialises this element and its subtree to an XML string.
   *
   * @returns The XML string representation.
   */
  public toString(): string {
    XElement.populateNamespacePrefixInfo(this);
    try {
      return this.toStringInternal();
    } finally {
      XElement.cleanupAfterSerialization(this);
    }
  }

  /**
   * Serialises this element to an indented (pretty-printed) XML string.
   *
   * @returns The indented XML string.
   *
   * @example
   * ```typescript
   * const root = new XElement('root', new XElement('child', new XElement('leaf')));
   * root.toStringWithIndentation();
   * // <root>
   * //   <child>
   * //     <leaf />
   * //   </child>
   * // </root>
   * ```
   */
  public toStringWithIndentation(): string {
    return indentXml(this.toString());
  }

  /**
   * Recursively populates namespace-prefix mappings for serialisation.
   * @internal
   */
  public static populateNamespacePrefixInfoRecurse(
    namespacePrefixInfo: NamespacePrefixInfo,
    element: XElement,
  ): void {
    const info = new NamespacePrefixInfo(namespacePrefixInfo);
    for (const attr of element.attributes()) {
      if (!attr.isNamespaceDeclaration) {
        continue;
      }
      if (attr.name.localName === "xmlns") {
        info.defaultNamespace = XNamespace.get(attr.value);
      } else {
        const ns = XNamespace.get(attr.value);
        const newPrefix = attr.name.localName;
        const existing = info.namespacePrefixPairs.find((p) => p.prefix === newPrefix);
        if (existing !== undefined) {
          existing.prefix = `p${NamespacePrefixInfo.pHashCount++}`;
        }
        info.namespacePrefixPairs.push(new NamespacePrefixPair(ns, newPrefix));
      }
    }
    for (const attr of element.attributes()) {
      if (attr.isNamespaceDeclaration) {
        continue;
      }
      if (attr.name.namespace === XNamespace.none) {
        continue;
      }
      const alreadyMapped = info.namespacePrefixPairs.some(
        (p) => p.namespace === attr.name.namespace,
      );
      if (!alreadyMapped) {
        if (attr.name.namespace === XNamespace.xml) {
          info.namespacePrefixPairs.push(new NamespacePrefixPair(attr.name.namespace, "xml"));
        } else {
          const pPrefix = `p${NamespacePrefixInfo.pHashCount++}`;
          info.namespacePrefixPairs.push(new NamespacePrefixPair(attr.name.namespace, pPrefix));
          const decl = new XAttribute(XNamespace.xmlns + pPrefix, attr.name.namespace.uri);
          decl.pHashNamespace = true;
          element.addAttributeContentObject(decl);
        }
      }
    }
    if (element.name.namespace !== XNamespace.none) {
      const alreadyMapped =
        info.namespacePrefixPairs.some((p) => p.namespace === element.name.namespace) ||
        element.name.namespace === info.defaultNamespace;
      if (!alreadyMapped) {
        if (element.name.namespace === XNamespace.xml) {
          info.namespacePrefixPairs.push(new NamespacePrefixPair(element.name.namespace, "xml"));
        } else {
          const pPrefix = `p${NamespacePrefixInfo.pHashCount++}`;
          info.namespacePrefixPairs.push(new NamespacePrefixPair(element.name.namespace, pPrefix));
          const decl = new XAttribute(XNamespace.xmlns + pPrefix, element.name.namespace.uri);
          decl.pHashNamespace = true;
          element.addAttributeContentObject(decl);
        }
      }
    }
    element.namespacePrefixInfo = info;
    for (const child of element.nodes().filter((n): n is XElement => n instanceof XElement)) {
      XElement.populateNamespacePrefixInfoRecurse(info, child);
    }
  }

  /**
   * Populates namespace-prefix mappings starting from the root of the tree.
   * @internal
   */
  public static populateNamespacePrefixInfo(element: XElement): void {
    let root: XElement = element;
    while (root.parent instanceof XElement) {
      root = root.parent;
    }
    const info = new NamespacePrefixInfo(XNamespace.none, []);
    XElement.populateNamespacePrefixInfoRecurse(info, root);
  }

  /**
   * Removes temporary namespace attributes created during serialisation.
   * @internal
   */
  public static cleanupAfterSerialization(element: XElement): void {
    let root: XElement = element;
    while (root.parent instanceof XElement) {
      root = root.parent;
    }
    for (const el of root.descendantsAndSelf()) {
      const toRemove = el.attributes().filter((a) => a.pHashNamespace);
      for (const attr of toRemove) {
        el.removeAttribute(attr);
      }
    }
    NamespacePrefixInfo.pHashCount = 0;
  }

  /**
   * Parses an XML string into an {@link XElement}.
   *
   * @param xml - The XML string to parse.
   * @returns The parsed element.
   *
   * @example
   * ```typescript
   * const el = XElement.parse('<items><item id="1"/></items>');
   * ```
   */
  public static parse(xml: string): XElement {
    return new SaxParser().parseElement(xml);
  }

  /**
   * Loads an XML file synchronously and parses it into an {@link XElement}.
   *
   * @param filePath - Path to the XML file.
   * @returns The parsed element.
   *
   * @example
   * ```typescript
   * const el = XElement.load('/path/to/data.xml');
   * ```
   */
  public static load(filePath: string): XElement {
    return new SaxParser().parseElementFromFile(filePath);
  }

  /**
   * Loads an XML file asynchronously and parses it into an {@link XElement}.
   *
   * @param filePath - Path to the XML file.
   * @returns A promise that resolves to the parsed element.
   *
   * @example
   * ```typescript
   * const el = await XElement.loadAsync('/path/to/data.xml');
   * ```
   */
  public static async loadAsync(filePath: string): Promise<XElement> {
    return new SaxParser().parseElementFromFileAsync(filePath);
  }
}
