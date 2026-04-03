/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XNode } from "./XNode.js";
import { XComment } from "./XComment.js";
import { XText } from "./XText.js";
import { XCData } from "./XCData.js";
import { XProcessingInstruction } from "./XProcessingInstruction.js";
import { XName } from "./XName.js";
import type { XElement } from "./XElement.js";

export class XContainer extends XNode {
  protected nodesArray: XNode[] = [];

  public nodes(): XNode[] {
    return [...this.nodesArray];
  }

  public get firstNode(): XNode | null {
    return this.nodesArray.length > 0 ? this.nodesArray[0] : null;
  }

  public get lastNode(): XNode | null {
    return this.nodesArray.length > 0 ? this.nodesArray[this.nodesArray.length - 1] : null;
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
    if ((content as { nodeType?: string })?.nodeType === "Attribute") {
      return;
    }
    if (typeof content === "string") {
      const text = new XText(content);
      text.parent = this;
      this.nodesArray.push(text);
      return;
    }
    if (
      content instanceof XComment ||
      content instanceof XText ||
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
    if ((content as { nodeType?: string })?.nodeType === "Element") {
      const el = content as XNode;
      el.parent = this;
      this.nodesArray.push(el);
      return;
    }
    const str = (content as { toString(): string }).toString();
    if (str !== "[object Object]") {
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
    const xname =
      name === undefined ? undefined : typeof name === "string" ? new XName(name) : name;
    return this.nodesArray.filter(
      (n): n is XElement =>
        n.nodeType === "Element" &&
        (xname === undefined || (n as unknown as XElement).name === xname),
    );
  }

  public element(name: XName | string): XElement | null {
    const xname = typeof name === "string" ? new XName(name) : name;
    return (
      this.nodesArray.find(
        (n): n is XElement => n.nodeType === "Element" && (n as unknown as XElement).name === xname,
      ) ?? null
    );
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
    if (node.nodeType === "Element" || node.nodeType === "Document") {
      const container = node as unknown as XContainer;
      for (const child of container.nodesArray) {
        this.addSelfAndDescendantsToTempArray(tempArray, child);
      }
    }
  }

  public descendants(): XElement[];
  public descendants(name: XName | string): XElement[];
  public descendants(name?: XName | string): XElement[] {
    const tempArray: XElement[] = [];
    const xname = name === undefined ? null : typeof name === "string" ? new XName(name) : name;
    for (const node of this.nodesArray) {
      if (node.nodeType === "Element") {
        this.addSelfAndDescendantsElementsToTempArray(
          tempArray,
          node as unknown as XElement,
          xname,
        );
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
      if (child.nodeType === "Element") {
        this.addSelfAndDescendantsElementsToTempArray(
          tempArray,
          child as unknown as XElement,
          name,
        );
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
    this.nodesArray = [...this.nodesArray.slice(0, idx), ...this.nodesArray.slice(idx + 1)];
  }

  public equals(other: XContainer): boolean {
    if (this.nodesArray.length !== other.nodesArray.length) {
      return false;
    }
    for (let i = 0; i < this.nodesArray.length; i++) {
      const a = this.nodesArray[i];
      const b = other.nodesArray[i];
      if (a.nodeType === "Element" && b.nodeType === "Element") {
        if (!(a as unknown as XElement).equals(b as unknown as XElement)) {
          return false;
        }
      } else if (a instanceof XComment && b instanceof XComment) {
        if (!a.equals(b)) {
          return false;
        }
      } else if (a instanceof XText && b instanceof XText) {
        if (!a.equals(b)) {
          return false;
        }
      } else if (a instanceof XCData && b instanceof XCData) {
        if (!a.equals(b)) {
          return false;
        }
      } else if (a instanceof XProcessingInstruction && b instanceof XProcessingInstruction) {
        if (!a.equals(b)) {
          return false;
        }
      } else {
        return false; // different types
      }
    }
    return true;
  }
}
