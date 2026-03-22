/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

export type XmlNodeType =
  | 'Element'
  | 'Text'
  | 'Comment'
  | 'CDATA'
  | 'ProcessingInstruction'
  | 'Entity'
  | 'Attribute'
  | 'Document'
  | null;

export class XObject {
  protected annotationsArray: any[] = [];
  public nodeType: XmlNodeType = null;
  public parent: XObject | null = null;
  public namespacePrefixInfo: NamespacePrefixInfo | null = null;

  addAnnotation(obj: any): void {
    this.annotationsArray.push(obj);
  }

  annotation<T>(ctor: new (...args: any[]) => T): T | null {
    for (const item of this.annotationsArray) {
      if (item instanceof ctor) return item as T;
    }
    return null;
  }

  annotations<T>(ctor: new (...args: any[]) => T): T[] {
    return this.annotationsArray.filter(item => item instanceof ctor) as T[];
  }

  removeAnnotations(): void;
  removeAnnotations<T>(ctor: new (...args: any[]) => T): void;
  removeAnnotations<T>(ctor?: new (...args: any[]) => T): void {
    if (ctor === undefined) {
      this.annotationsArray = [];
    } else {
      this.annotationsArray = this.annotationsArray.filter(item => item.constructor !== ctor);
    }
  }

  public get document(): XDocument | null {
    let current: XObject = this;
    while (current.parent !== null) {
      current = current.parent;
    }
    return current instanceof XDocument ? current : null;
  }
}

export class XNode extends XObject {
  public addAfterSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as XContainer).insertAfterChild(this, ...content);
  }

  public addBeforeSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as XContainer).insertBeforeChild(this, ...content);
  }

  public replaceWith(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as XContainer).replaceChild(this, ...content);
  }

  public ancestors(): XElement[];
  public ancestors(name: XName | string): XElement[];
  public ancestors(name?: XName | string): XElement[] {
    const result: XElement[] = [];
    let current: XObject | null = this.parent;
    while (current instanceof XElement) {
      result.push(current);
      current = current.parent;
    }
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public elementsAfterSelf(): XElement[];
  public elementsAfterSelf(name: XName | string): XElement[];
  public elementsAfterSelf(name?: XName | string): XElement[] {
    if (!(this.parent instanceof XContainer)) return [];
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    const result = siblings.slice(idx + 1).filter((n): n is XElement => n instanceof XElement);
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public elementsBeforeSelf(): XElement[];
  public elementsBeforeSelf(name: XName | string): XElement[];
  public elementsBeforeSelf(name?: XName | string): XElement[] {
    if (!(this.parent instanceof XContainer)) return [];
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    const result = siblings.slice(0, idx).filter((n): n is XElement => n instanceof XElement);
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public nodesBeforeSelf(): XNode[] {
    if (!(this.parent instanceof XContainer)) return [];
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    return siblings.slice(0, idx);
  }

  public nodesAfterSelf(): XNode[] {
    if (!(this.parent instanceof XContainer)) return [];
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    return siblings.slice(idx + 1);
  }

  public get previousNode(): XNode | null {
    if (!(this.parent instanceof XContainer)) return null;
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    return idx > 0 ? siblings[idx - 1] : null;
  }

  public get nextNode(): XNode | null {
    if (!(this.parent instanceof XContainer)) return null;
    const siblings = (this.parent as XContainer).nodes();
    const idx = siblings.indexOf(this);
    return idx < siblings.length - 1 ? siblings[idx + 1] : null;
  }

  public remove(): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as XContainer).removeChild(this);
    this.parent = null;
  }

  public deepEquals(other: XNode): boolean {
    if (this instanceof XElement && other instanceof XElement) return this.equals(other);
    if (this instanceof XDocument && other instanceof XDocument) return this.equals(other);
    if (this instanceof XComment && other instanceof XComment) return this.equals(other);
    if (this instanceof XText && other instanceof XText) return this.equals(other);
    if (this instanceof XEntity && other instanceof XEntity) return this.equals(other);
    if (this instanceof XCData && other instanceof XCData) return this.equals(other);
    if (this instanceof XProcessingInstruction && other instanceof XProcessingInstruction) return this.equals(other);
    return false;
  }

  public static deepEquals(a: XNode, b: XNode): boolean {
    return a.deepEquals(b);
  }
}

export class XComment extends XNode {
  public readonly value: string;

  constructor(content: string);
  constructor(other: XComment);
  constructor(contentOrOther: string | XComment) {
    super();
    this.nodeType = 'Comment';
    if (typeof contentOrOther === 'string') {
      this.value = contentOrOther;
    } else {
      this.value = contentOrOther.value;
    }
  }

  public equals(other: XComment): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return `<!--${this.value}-->`;
  }
}

function xmlEscapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class XText extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XText);
  constructor(valueOrOther: string | XText) {
    super();
    this.nodeType = 'Text';
    if (typeof valueOrOther === 'string') {
      this.value = valueOrOther;
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XText): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return xmlEscapeText(this.value);
  }
}

export class XEntity extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XEntity);
  constructor(valueOrOther: string | XEntity) {
    super();
    this.nodeType = 'Entity';
    if (typeof valueOrOther === 'string') {
      this.value = valueOrOther;
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XEntity): boolean {
    return this.value === other.value;
  }
}

export class XCData extends XNode {
  public readonly value: string;

  constructor(value: string);
  constructor(other: XCData);
  constructor(valueOrOther: string | XCData) {
    super();
    this.nodeType = 'CDATA';
    if (typeof valueOrOther === 'string') {
      this.value = valueOrOther;
    } else {
      this.value = valueOrOther.value;
    }
  }

  public equals(other: XCData): boolean {
    return this.value === other.value;
  }
}

export class XProcessingInstruction extends XNode {
  public readonly target: string;
  public readonly data: string;

  constructor(target: string, data: string);
  constructor(other: XProcessingInstruction);
  constructor(targetOrOther: string | XProcessingInstruction, data?: string) {
    super();
    this.nodeType = 'ProcessingInstruction';
    if (typeof targetOrOther === 'string') {
      this.target = targetOrOther;
      this.data = data!;
    } else {
      this.target = targetOrOther.target;
      this.data = targetOrOther.data;
    }
  }

  public equals(other: XProcessingInstruction): boolean {
    return this.target === other.target && this.data === other.data;
  }
}

export class XContainer extends XNode {
  protected nodesArray: XNode[] = [];

  public nodes(): XNode[] {
    return [...this.nodesArray];
  }

  public get firstNode(): XNode | null {
    return this.nodesArray.length > 0 ? this.nodesArray[0] : null;
  }

  public get lastNode(): XNode | null {
    return this.nodesArray.length > 0
      ? this.nodesArray[this.nodesArray.length - 1]
      : null;
  }

  protected addContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addContentObject(item);
    }
  }

  protected addContentObject(content: unknown): void {
    if (content === null || content === undefined) {
      return;
    }
    if (Array.isArray(content)) {
      for (const item of content) {
        this.addContentObject(item);
      }
      return;
    }
    if (content instanceof XAttribute) {
      return;
    }
    if (typeof content === 'string') {
      const text = new XText(content);
      text.parent = this;
      this.nodesArray.push(text);
      return;
    }
    if (
      content instanceof XComment ||
      content instanceof XText ||
      content instanceof XEntity ||
      content instanceof XCData ||
      content instanceof XProcessingInstruction
    ) {
      let node: XNode;
      if (content.parent === null) {
        content.parent = this;
        node = content;
      } else {
        if (content instanceof XComment) {
          node = new XComment(content);
        } else if (content instanceof XText) {
          node = new XText(content);
        } else if (content instanceof XEntity) {
          node = new XEntity(content);
        } else if (content instanceof XCData) {
          node = new XCData(content);
        } else {
          node = new XProcessingInstruction(content);
        }
        node.parent = this;
      }
      this.nodesArray.push(node);
      return;
    }
    if (content instanceof XElement) {
      content.parent = this;
      this.nodesArray.push(content);
      return;
    }
    const str = (content as { toString(): string }).toString();
    if (str !== '[object Object]') {
      const text = new XText(str);
      text.parent = this;
      this.nodesArray.push(text);
    }
  }

  protected insertContentItems(...items: unknown[]): void {
    this.addContentList(...items);
  }

  public insertAfterChild(child: XNode, ...content: unknown[]): void {
    const copy = [...this.nodesArray];
    this.nodesArray = [];
    const idx = copy.indexOf(child);
    for (let i = 0; i <= idx; i++) {
      this.nodesArray.push(copy[i]);
    }
    this.insertContentItems(...content);
    for (let i = idx + 1; i < copy.length; i++) {
      this.nodesArray.push(copy[i]);
    }
  }

  public add(...content: unknown[]): void {
    this.insertContentItems(...content);
  }

  public replaceNodes(...content: unknown[]): void {
    for (const node of this.nodesArray) {
      node.parent = null;
    }
    this.nodesArray = [];
    this.insertContentItems(...content);
  }

  public removeNodes(): void {
    this.replaceNodes();
  }

  public elements(): XElement[];
  public elements(name: XName | string): XElement[];
  public elements(name?: XName | string): XElement[] {
    const xname = name === undefined ? undefined : (typeof name === 'string' ? new XName(name) : name);
    return this.nodesArray.filter(
      (n): n is XElement => n instanceof XElement && (xname === undefined || n.name === xname),
    );
  }

  public element(name: XName | string): XElement | null {
    const xname = typeof name === 'string' ? new XName(name) : name;
    return this.nodesArray.find(
      (n): n is XElement => n instanceof XElement && n.name === xname,
    ) ?? null;
  }

  public descendantNodes(): XNode[] {
    const tempArray: XNode[] = [];
    for (const node of this.nodesArray) {
      this.addSelfAndDescendantsToTempArray(tempArray, node);
    }
    return tempArray;
  }

  protected addSelfAndDescendantsToTempArray(tempArray: XNode[], node: XNode): void {
    tempArray.push(node);
    if (node instanceof XContainer) {
      for (const child of node.nodesArray) {
        this.addSelfAndDescendantsToTempArray(tempArray, child);
      }
    }
  }

  public descendants(): XElement[];
  public descendants(name: XName | string): XElement[];
  public descendants(name?: XName | string): XElement[] {
    const tempArray: XElement[] = [];
    const xname = name === undefined ? null : (typeof name === 'string' ? new XName(name) : name);
    for (const node of this.nodesArray) {
      if (node instanceof XElement) {
        this.addSelfAndDescendantsElementsToTempArray(tempArray, node, xname);
      }
    }
    return tempArray;
  }

  protected addSelfAndDescendantsElementsToTempArray(
    tempArray: XElement[],
    element: XElement,
    name: XName | null,
  ): void {
    if (name === null || element.name === name) {
      tempArray.push(element);
    }
    for (const child of element.nodesArray) {
      if (child instanceof XElement) {
        this.addSelfAndDescendantsElementsToTempArray(tempArray, child, name);
      }
    }
  }

  public addFirst(...content: unknown[]): void {
    const copy = [...this.nodesArray];
    this.nodesArray = copy; // let XDocument see existing nodes for constraint checks
    const priorLen = this.nodesArray.length;
    this.insertContentItems(...content);
    const newNodes = this.nodesArray.splice(priorLen);
    this.nodesArray = [...newNodes, ...copy];
  }

  public insertBeforeChild(child: XNode, ...content: unknown[]): void {
    const copy = [...this.nodesArray];
    const idx = copy.indexOf(child);
    // Pre-populate the suffix so insertContentItems can check existing nodes
    // (e.g. XDocument's single-root constraint).
    this.nodesArray = copy.slice(idx);
    const suffixLen = this.nodesArray.length;
    this.insertContentItems(...content);
    // New nodes were appended after the suffix; extract and reorder.
    const newNodes = this.nodesArray.splice(suffixLen);
    this.nodesArray = [...copy.slice(0, idx), ...newNodes, ...this.nodesArray];
  }

  public replaceChild(child: XNode, ...content: unknown[]): void {
    const copy = [...this.nodesArray];
    const idx = copy.indexOf(child);
    // Pre-populate suffix so insertContentItems can check existing nodes
    // (e.g. XDocument's single-root constraint).
    this.nodesArray = copy.slice(idx + 1);
    const suffixLen = this.nodesArray.length;
    this.insertContentItems(...content);
    // New nodes were appended after the suffix; extract and reorder.
    const newNodes = this.nodesArray.splice(suffixLen);
    this.nodesArray = [...copy.slice(0, idx), ...newNodes, ...this.nodesArray];
  }

  public removeChild(child: XNode): void {
    const idx = this.nodesArray.indexOf(child);
    this.nodesArray = [
      ...this.nodesArray.slice(0, idx),
      ...this.nodesArray.slice(idx + 1),
    ];
  }

  public equals(other: XContainer): boolean {
    if (this.nodesArray.length !== other.nodesArray.length) return false;
    for (let i = 0; i < this.nodesArray.length; i++) {
      const a = this.nodesArray[i];
      const b = other.nodesArray[i];
      if (a instanceof XElement && b instanceof XElement) {
        if (!a.equals(b)) return false;
      } else if (a instanceof XComment && b instanceof XComment) {
        if (!a.equals(b)) return false;
      } else if (a instanceof XText && b instanceof XText) {
        if (!a.equals(b)) return false;
      } else if (a instanceof XEntity && b instanceof XEntity) {
        if (!a.equals(b)) return false;
      } else if (a instanceof XCData && b instanceof XCData) {
        if (!a.equals(b)) return false;
      } else if (a instanceof XProcessingInstruction && b instanceof XProcessingInstruction) {
        if (!a.equals(b)) return false;
      } else {
        return false; // different types
      }
    }
    return true;
  }
}

export class XAttribute extends XObject {
  public readonly name: XName;
  public value: string;

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
    (this.parent as XElement).removeAttribute(this);
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

  public toString(): string {
    return `${this.name.getPrefixedName(this)}='${this.value}'`;
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
        } else if (node instanceof XEntity) {
          clonedNode = new XEntity(node);
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
    let current: XObject | null = this.parent;
    while (current instanceof XElement) {
      result.push(current);
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

  public toString(): string {
    const prefixedName = this.name.getPrefixedName(this);
    const attrs = this.attributesArray.map(a => a.toString()).join(' ');
    const attrsStr = attrs.length > 0 ? ' ' + attrs : '';

    if (this.nodesArray.length === 0) {
      return `<${prefixedName}${attrsStr} />`;
    }

    const content = this.nodesArray.map(n => n.toString()).join('');
    return `<${prefixedName}${attrsStr}>${content}</${prefixedName}>`;
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
        info.namespacePrefixPairs.push(
          new NamespacePrefixPair(attr.name.namespace, `p${NamespacePrefixInfo.pHashCount++}`)
        );
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
}

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
}

export class XDocument extends XContainer {
  public readonly declaration: XDeclaration | null;

  constructor();
  constructor(declaration: XDeclaration);
  constructor(other: XDocument);
  constructor(...content: unknown[]);
  constructor(declaration: XDeclaration, ...content: unknown[]);
  constructor(firstOrContent?: XDeclaration | XDocument | unknown, ...rest: unknown[]) {
    super();
    this.nodeType = 'Document';
    if (firstOrContent instanceof XDocument) {
      const other = firstOrContent;
      this.declaration = other.declaration !== null
        ? new XDeclaration(other.declaration)
        : null;
      for (const node of other.nodesArray) {
        if (node.parent === null) {
          node.parent = this;
          this.nodesArray.push(node);
        } else {
          let clonedNode: XNode;
          if (node instanceof XElement) {
            clonedNode = new XElement(node);
          } else if (node instanceof XComment) {
            clonedNode = new XComment(node);
          } else if (node instanceof XText) {
            clonedNode = new XText(node);
          } else if (node instanceof XEntity) {
            clonedNode = new XEntity(node);
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
      }
    } else if (firstOrContent instanceof XDeclaration) {
      this.declaration = firstOrContent;
      this.addDocumentContentList(...rest);
    } else if (firstOrContent === undefined) {
      this.declaration = null;
    } else {
      this.declaration = null;
      this.addDocumentContentList(firstOrContent, ...rest);
    }
  }

  public override equals(other: XDocument): boolean {
    if (this.declaration === null && other.declaration !== null) return false;
    if (this.declaration !== null && other.declaration === null) return false;
    if (this.declaration !== null && other.declaration !== null) {
      if (!this.declaration.equals(other.declaration)) return false;
    }
    return super.equals(other);
  }

  public get root(): XElement | null {
    return (this.nodesArray.find(n => n instanceof XElement) as XElement) ?? null;
  }

  protected override insertContentItems(...items: unknown[]): void {
    this.addDocumentContentList(...items);
  }

  protected addDocumentContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addDocumentContentObject(item);
    }
  }

  protected addDocumentContentObject(content: unknown): void {
    if (content === null || content === undefined) {
      return;
    }
    if (Array.isArray(content)) {
      for (const item of content) {
        this.addDocumentContentObject(item);
      }
      return;
    }
    if (content instanceof XAttribute) {
      throw new Error('XAttribute is not valid content for an XDocument.');
    }
    if (content instanceof XEntity) {
      throw new Error('XEntity is not valid content for an XDocument.');
    }
    if (content instanceof XCData) {
      throw new Error('XCData is not valid content for an XDocument.');
    }
    if (typeof content === 'string') {
      if (/\S/.test(content)) {
        throw new Error('Non-whitespace string content is not valid for an XDocument.');
      }
      const text = new XText(content);
      text.parent = this;
      this.nodesArray.push(text);
      return;
    }
    if (
      content instanceof XComment ||
      content instanceof XText ||
      content instanceof XProcessingInstruction ||
      content instanceof XElement
    ) {
      if (content instanceof XText && /\S/.test(content.value)) {
        throw new Error('XText with non-whitespace content is not valid for an XDocument.');
      }
      if (content instanceof XElement && this.nodesArray.some(n => n instanceof XElement)) {
        throw new Error('An XDocument may contain only one XElement.');
      }
      if (content.parent === null) {
        content.parent = this;
        this.nodesArray.push(content);
      } else {
        let clonedNode: XNode;
        if (content instanceof XElement) {
          clonedNode = new XElement(content);
        } else if (content instanceof XComment) {
          clonedNode = new XComment(content);
        } else if (content instanceof XText) {
          clonedNode = new XText(content);
        } else {
          clonedNode = new XProcessingInstruction(content);
        }
        clonedNode.parent = this;
        this.nodesArray.push(clonedNode);
      }
      return;
    }
  }
}

class XNameCacheEntry {
  name: XName;

  constructor(name: XName) {
    this.name = name;
  }
}

class XNamespaceCacheEntry {
  namespace: XNamespace;
  preferredPrefix: string | null;

  constructor(namespace: XNamespace, preferredPrefix: string | null) {
    this.namespace = namespace;
    this.preferredPrefix = preferredPrefix;
  }
}

export class XNamespace {
  private static namespaceCache: Map<string, XNamespaceCacheEntry> = new Map();

  public static readonly none: XNamespace = new XNamespace('');
  public static readonly xml: XNamespace = new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  public static readonly xmlns: XNamespace = new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');

  public readonly uri: string;

  public get preferredPrefix(): string | null {
    return XNamespace.namespaceCache.get(this.uri)?.preferredPrefix ?? null;
  }

  public get namespaceName(): string {
    return this.uri;
  }

  public static get(uri: string): XNamespace {
    return new XNamespace(uri);
  }

  public static getNone(): XNamespace {
    return new XNamespace('');
  }

  public static getXml(): XNamespace {
    return new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  }

  public static getXmlns(): XNamespace {
    return new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');
  }

  public toString(): string {
    return this.uri === '' ? '' : `{${this.uri}}`;
  }

  public getName(localName: string): XName {
    return new XName(this, localName);
  }

  public equals(other: XNamespace): boolean {
    return this === other;
  }

  public getPrefix(_contextObject: XObject): string {
    return 'p';
  }

  constructor(uri: string, preferredPrefix: string | null = null) {
    this.uri = uri;

    const cached = XNamespace.namespaceCache.get(uri);
    if (cached) {
      if (cached.preferredPrefix !== preferredPrefix) {
        cached.preferredPrefix = preferredPrefix;
      }
      return cached.namespace;
    }

    XNamespace.namespaceCache.set(uri, new XNamespaceCacheEntry(this, preferredPrefix));
  }
}

export class NamespacePrefixPair {
  public readonly namespace: XNamespace;
  public prefix: string;

  constructor(namespace: XNamespace, prefix: string) {
    this.namespace = namespace;
    this.prefix = prefix;
  }
}

export class NamespacePrefixInfo {
  public static pHashCount: number = 0;
  public defaultNamespace: XNamespace;
  public readonly namespacePrefixPairs: NamespacePrefixPair[];

  constructor(defaultNamespace: XNamespace, namespacePrefixPairs: NamespacePrefixPair[]);
  constructor(other: NamespacePrefixInfo);
  constructor(
    defaultNamespaceOrOther: XNamespace | NamespacePrefixInfo,
    namespacePrefixPairs?: NamespacePrefixPair[]
  ) {
    if (defaultNamespaceOrOther instanceof NamespacePrefixInfo) {
      this.defaultNamespace = defaultNamespaceOrOther.defaultNamespace;
      this.namespacePrefixPairs = [...defaultNamespaceOrOther.namespacePrefixPairs];
    } else {
      this.defaultNamespace = defaultNamespaceOrOther;
      this.namespacePrefixPairs = namespacePrefixPairs!;
    }
  }
}

export class XName {
  private static nameCache: Map<string, XNameCacheEntry> = new Map();

  public readonly namespace: XNamespace;
  public readonly localName: string;

  public get namespaceName(): string {
    return this.namespace.uri;
  }

  public static get(namespace: XNamespace, localName: string): XName
  public static get(name: string): XName
  public static get(namespaceOrName: XNamespace | string, localName?: string): XName {
    if (namespaceOrName instanceof XNamespace) {
      return new XName(namespaceOrName, localName!);
    }
    return new XName(namespaceOrName);
  }

  constructor(namespace: XNamespace, localName: string)
  constructor(name: string)
  constructor(namespaceOrName: XNamespace | string, localName?: string) {
    let ns: XNamespace;
    let local: string;

    if (namespaceOrName instanceof XNamespace) {
      ns = namespaceOrName;
      local = localName!;
    } else {
      const name = namespaceOrName;
      if (name.startsWith('{')) {
        const closeIdx = name.indexOf('}');
        if (closeIdx === -1) {
          throw new Error(`Invalid clark notation name: '${name}'`);
        }
        ns = new XNamespace(name.slice(1, closeIdx));
        local = name.slice(closeIdx + 1);
      } else {
        ns = XNamespace.none;
        local = name;
      }
    }

    this.namespace = ns;
    this.localName = local;

    const clarkKey = ns.uri === '' ? local : `{${ns.uri}}${local}`;
    const cached = XName.nameCache.get(clarkKey);
    if (cached) {
      return cached.name;
    }

    XName.nameCache.set(clarkKey, new XNameCacheEntry(this));
  }

  public toString(): string {
    return this.namespace.uri === '' ? this.localName : `{${this.namespace.uri}}${this.localName}`;
  }

  public equals(other: XName): boolean {
    return this === other;
  }

  public getPrefixedName(contextObject: XObject): string {
    if (this.namespace === XNamespace.none) return this.localName;
    return `${this.namespace.getPrefix(contextObject)}:${this.localName}`;
  }
}
