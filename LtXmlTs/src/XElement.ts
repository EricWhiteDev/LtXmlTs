/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XContainer } from './XContainer.js';
import { XName } from './XName.js';
import { XAttribute } from './XAttribute.js';
import { XNamespace } from './XNamespace.js';
import { NamespacePrefixInfo, NamespacePrefixPair } from './NamespacePrefixInfo.js';
import { XComment } from './XComment.js';
import { XText } from './XText.js';
import { XCData } from './XCData.js';
import { XProcessingInstruction } from './XProcessingInstruction.js';
import { XNode } from './XNode.js';
import { indentXml } from './XmlUtils.js';
import { SaxParser } from './SaxParser.js';

export class XElement extends XContainer {
  public readonly name: XName;
  private attributesArray: XAttribute[] = [];

  public get value(): string {
    return this.descendantNodes()
      .filter((n): n is XText => n instanceof XText)
      .map(n => n.value)
      .join('');
  }

  public set value(value: string) {
    this.removeNodes();
    this.addContentList(new XText(value));
  }

  public attributes(): XAttribute[];
  public attributes(name: XName | string): XAttribute[];
  public attributes(name?: XName | string): XAttribute[] {
    const xname = name === undefined ? undefined : (typeof name === 'string' ? new XName(name) : name);
    return this.attributesArray.filter((a) => xname === undefined || a.name === xname);
  }

  public attribute(name: XName | string): XAttribute | null {
    const xname = typeof name === 'string' ? new XName(name) : name;
    return this.attributesArray.find((a) => a.name === xname) ?? null;
  }

  public get firstAttribute(): XAttribute | null {
    return this.attributesArray.length > 0 ? this.attributesArray[0] : null;
  }

  public get lastAttribute(): XAttribute | null {
    return this.attributesArray.length > 0
      ? this.attributesArray[this.attributesArray.length - 1]
      : null;
  }

  public get hasAttributes(): boolean {
    return this.attributesArray.length > 0;
  }

  public descendantNodesAndSelf(): XNode[] {
    const tempArray: XNode[] = [];
    tempArray.push(this);
    for (const node of this.nodesArray) {
      this.addSelfAndDescendantsToTempArray(tempArray, node);
    }
    return tempArray;
  }

  public descendantsAndSelf(): XElement[];
  public descendantsAndSelf(name: XName | string): XElement[];
  public descendantsAndSelf(name?: XName | string): XElement[] {
    const tempArray: XElement[] = [];
    const xname = name === undefined ? null : (typeof name === 'string' ? new XName(name) : name);
    this.addSelfAndDescendantsElementsToTempArray(tempArray, this, xname);
    return tempArray;
  }

  public get hasElements(): boolean {
    return this.nodesArray.some(n => n instanceof XElement);
  }

  public get isEmpty(): boolean {
    return this.nodesArray.length === 0;
  }

  protected addAttributeContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addAttributeContentObject(item);
    }
  }

  public removeAttribute(attr: XAttribute): void {
    const idx = this.attributesArray.indexOf(attr);
    this.attributesArray = [
      ...this.attributesArray.slice(0, idx),
      ...this.attributesArray.slice(idx + 1),
    ];
    attr.parent = null;
  }

  public removeAttributes(): void {
    for (const attr of this.attributesArray) {
      attr.parent = null;
    }
    this.attributesArray = [];
  }

  public replaceAttributes(...content: unknown[]): void {
    this.removeAttributes();
    this.addAttributeContentList(...content);
  }

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

  public removeAll(): void {
    for (const attr of this.attributesArray) {
      attr.parent = null;
    }
    this.attributesArray = [];
    this.removeNodes();
  }

  public replaceAll(...content: unknown[]): void {
    this.removeAll();
    this.addContentList(...content);
    this.addAttributeContentList(...content);
  }

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

  constructor(name: XName | string);
  constructor(name: XName | string, ...content: unknown[]);
  constructor(other: XElement);
  constructor(nameOrOther: XName | XElement | string, ...content: unknown[]) {
    super();
    this.nodeType = 'Element';
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
      const name = typeof nameOrOther === 'string' ? new XName(nameOrOther) : nameOrOther;
      this.name = name;
      this.addContentList(...content);
      this.addAttributeContentList(...content);
    }
  }

  public ancestorsAndSelf(): XElement[];
  public ancestorsAndSelf(name: XName | string): XElement[];
  public ancestorsAndSelf(name?: XName | string): XElement[] {
    const result: XElement[] = [this];
    let current = this.parent;
    while (current !== null && current.nodeType === 'Element') {
      result.push(current as unknown as XElement);
      current = current.parent;
    }
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public override equals(other: XElement): boolean {
    if (!this.name.equals(other.name)) return false;
    if (this.attributesArray.length !== other.attributesArray.length) return false;
    for (let i = 0; i < this.attributesArray.length; i++) {
      if (!this.attributesArray[i].equals(other.attributesArray[i])) return false;
    }
    return super.equals(other);
  }

  public toStringInternal(): string {
    const prefixedName = this.name.getPrefixedName(this);
    const attrs = this.attributesArray.map(a => a.toStringInternal()).join(' ');
    const attrsStr = attrs.length > 0 ? ' ' + attrs : '';

    if (this.nodesArray.length === 0) {
      return `<${prefixedName}${attrsStr} />`;
    }

    const content = this.nodesArray.map(n => n.toStringInternal()).join('');
    return `<${prefixedName}${attrsStr}>${content}</${prefixedName}>`;
  }

  public toString(): string {
    XElement.populateNamespacePrefixInfo(this);
    try {
      return this.toStringInternal();
    } finally {
      XElement.cleanupAfterSerialization(this);
    }
  }

  public toStringWithIndentation(): string {
    return indentXml(this.toString());
  }

  public static populateNamespacePrefixInfoRecurse(
    namespacePrefixInfo: NamespacePrefixInfo,
    element: XElement
  ): void {
    const info = new NamespacePrefixInfo(namespacePrefixInfo);
    for (const attr of element.attributes()) {
      if (!attr.isNamespaceDeclaration) continue;
      if (attr.name.localName === 'xmlns') {
        info.defaultNamespace = XNamespace.get(attr.value);
      } else {
        const ns = XNamespace.get(attr.value);
        const newPrefix = attr.name.localName;
        const existing = info.namespacePrefixPairs.find(p => p.prefix === newPrefix);
        if (existing !== undefined) {
          existing.prefix = `p${NamespacePrefixInfo.pHashCount++}`;
        }
        info.namespacePrefixPairs.push(new NamespacePrefixPair(ns, newPrefix));
      }
    }
    for (const attr of element.attributes()) {
      if (attr.isNamespaceDeclaration) continue;
      if (attr.name.namespace === XNamespace.none) continue;
      const alreadyMapped = info.namespacePrefixPairs.some(p => p.namespace === attr.name.namespace);
      if (!alreadyMapped) {
        if (attr.name.namespace === XNamespace.xml) {
          info.namespacePrefixPairs.push(new NamespacePrefixPair(attr.name.namespace, 'xml'));
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
      const alreadyMapped = info.namespacePrefixPairs.some(p => p.namespace === element.name.namespace)
        || element.name.namespace === info.defaultNamespace;
      if (!alreadyMapped) {
        if (element.name.namespace === XNamespace.xml) {
          info.namespacePrefixPairs.push(new NamespacePrefixPair(element.name.namespace, 'xml'));
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

  public static populateNamespacePrefixInfo(element: XElement): void {
    let root: XElement = element;
    while (root.parent instanceof XElement) {
      root = root.parent;
    }
    const info = new NamespacePrefixInfo(XNamespace.none, []);
    XElement.populateNamespacePrefixInfoRecurse(info, root);
  }

  public static cleanupAfterSerialization(element: XElement): void {
    let root: XElement = element;
    while (root.parent instanceof XElement) {
      root = root.parent;
    }
    for (const el of root.descendantsAndSelf()) {
      const toRemove = el.attributes().filter(a => a.pHashNamespace);
      for (const attr of toRemove) {
        el.removeAttribute(attr);
      }
    }
    NamespacePrefixInfo.pHashCount = 0;
  }

  public static parse(xml: string): XElement {
    return new SaxParser().parseElement(xml);
  }

  public static load(filePath: string): XElement {
    return new SaxParser().parseElementFromFile(filePath);
  }

  public static async loadAsync(filePath: string): Promise<XElement> {
    return new SaxParser().parseElementFromFileAsync(filePath);
  }
}
