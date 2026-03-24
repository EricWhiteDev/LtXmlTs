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
import type { XContainer } from './XContainer.js';
import type { XElement } from './XElement.js';
import type { XDocument } from './XDocument.js';
import type { XComment } from './XComment.js';
import type { XText } from './XText.js';
import type { XCData } from './XCData.js';
import type { XProcessingInstruction } from './XProcessingInstruction.js';

export class XNode extends XObject {
  public addAfterSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as unknown as XContainer).insertAfterChild(this, ...content);
  }

  public addBeforeSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as unknown as XContainer).insertBeforeChild(this, ...content);
  }

  public replaceWith(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as unknown as XContainer).replaceChild(this, ...content);
  }

  public ancestors(): XElement[];
  public ancestors(name: XName | string): XElement[];
  public ancestors(name?: XName | string): XElement[] {
    const result: XElement[] = [];
    let current: XObject | null = this.parent;
    while (current !== null && current.nodeType === 'Element') {
      result.push(current as unknown as XElement);
      current = current.parent;
    }
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  private get parentContainer(): XContainer | null {
    if (this.parent === null) return null;
    const t = this.parent.nodeType;
    if (t !== 'Element' && t !== 'Document') return null;
    return this.parent as unknown as XContainer;
  }

  public elementsAfterSelf(): XElement[];
  public elementsAfterSelf(name: XName | string): XElement[];
  public elementsAfterSelf(name?: XName | string): XElement[] {
    const container = this.parentContainer;
    if (container === null) return [];
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    const result = siblings.slice(idx + 1).filter((n): n is XElement => n.nodeType === 'Element') as XElement[];
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public elementsBeforeSelf(): XElement[];
  public elementsBeforeSelf(name: XName | string): XElement[];
  public elementsBeforeSelf(name?: XName | string): XElement[] {
    const container = this.parentContainer;
    if (container === null) return [];
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    const result = siblings.slice(0, idx).filter((n): n is XElement => n.nodeType === 'Element') as XElement[];
    if (name === undefined) return result;
    const xname = typeof name === 'string' ? new XName(name) : name;
    return result.filter(e => e.name === xname);
  }

  public nodesBeforeSelf(): XNode[] {
    const container = this.parentContainer;
    if (container === null) return [];
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return siblings.slice(0, idx);
  }

  public nodesAfterSelf(): XNode[] {
    const container = this.parentContainer;
    if (container === null) return [];
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return siblings.slice(idx + 1);
  }

  public get previousNode(): XNode | null {
    const container = this.parentContainer;
    if (container === null) return null;
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return idx > 0 ? siblings[idx - 1] : null;
  }

  public get nextNode(): XNode | null {
    const container = this.parentContainer;
    if (container === null) return null;
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return idx < siblings.length - 1 ? siblings[idx + 1] : null;
  }

  public remove(): void {
    if (this.parent === null) {
      throw new Error('The parent is missing.');
    }
    (this.parent as unknown as XContainer).removeChild(this);
    this.parent = null;
  }

  public deepEquals(other: XNode): boolean {
    if (this.nodeType === 'Element' && other.nodeType === 'Element')
      return (this as unknown as XElement).equals(other as unknown as XElement);
    if (this.nodeType === 'Document' && other.nodeType === 'Document')
      return (this as unknown as XDocument).equals(other as unknown as XDocument);
    if (this.nodeType === 'Comment' && other.nodeType === 'Comment')
      return (this as unknown as XComment).equals(other as unknown as XComment);
    if (this.nodeType === 'Text' && other.nodeType === 'Text')
      return (this as unknown as XText).equals(other as unknown as XText);
    if (this.nodeType === 'CDATA' && other.nodeType === 'CDATA')
      return (this as unknown as XCData).equals(other as unknown as XCData);
    if (this.nodeType === 'ProcessingInstruction' && other.nodeType === 'ProcessingInstruction')
      return (this as unknown as XProcessingInstruction).equals(other as unknown as XProcessingInstruction);
    return false;
  }

  public static deepEquals(a: XNode, b: XNode): boolean {
    return a.deepEquals(b);
  }

  public toStringInternal(): string {
    return this.toString();
  }
}
