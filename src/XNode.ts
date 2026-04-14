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
import type { XContainer } from "./XContainer.js";
import type { XElement } from "./XElement.js";
import type { XDocument } from "./XDocument.js";
import type { XComment } from "./XComment.js";
import type { XText } from "./XText.js";
import type { XCData } from "./XCData.js";
import type { XProcessingInstruction } from "./XProcessingInstruction.js";

/**
 * Abstract base class for all XML nodes: elements, text, comments,
 * CDATA sections, and processing instructions.
 *
 * @remarks
 * `XNode` extends {@link XObject} with sibling navigation, ancestor queries,
 * parent-relative insertion and removal, and deep equality comparison.
 *
 * @category Class and Type Reference
 */
export class XNode extends XObject {
  /**
   * Inserts the specified content immediately after this node in its parent.
   *
   * @param content - One or more nodes or strings to insert.
   * @throws Error if this node has no parent.
   *
   * @example
   * ```typescript
   * const parent = new XElement('p', new XElement('a'), new XElement('c'));
   * const a = parent.elements()[0];
   * a.addAfterSelf(new XElement('b'));
   * // parent now contains <a/>, <b/>, <c/>
   * ```
   */
  public addAfterSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error("The parent is missing.");
    }
    (this.parent as unknown as XContainer).insertAfterChild(this, ...content);
  }

  /**
   * Inserts the specified content immediately before this node in its parent.
   *
   * @param content - One or more nodes or strings to insert.
   * @throws Error if this node has no parent.
   */
  public addBeforeSelf(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error("The parent is missing.");
    }
    (this.parent as unknown as XContainer).insertBeforeChild(this, ...content);
  }

  /**
   * Replaces this node with the specified content.
   *
   * @param content - One or more nodes or strings that replace this node.
   * @throws Error if this node has no parent.
   */
  public replaceWith(...content: unknown[]): void {
    if (this.parent === null) {
      throw new Error("The parent is missing.");
    }
    (this.parent as unknown as XContainer).replaceChild(this, ...content);
  }

  /**
   * Returns a collection of the ancestor elements of this node.
   *
   * @remarks
   * When called with no arguments, returns all ancestor elements from the
   * immediate parent up to the root. When a name is supplied, only ancestors
   * with that name are returned. The collection is ordered from nearest
   * ancestor to farthest.
   *
   * @returns An array of ancestor {@link XElement} instances.
   *
   * @example
   * ```typescript
   * const xml = XElement.parse('<root><a><b/></a></root>');
   * const b = xml.descendants('b')[0];
   * b.ancestors();        // [<a>, <root>]
   * b.ancestors('root');  // [<root>]
   * ```
   */
  public ancestors(): XElement[];
  /**
   * Returns a collection of the ancestor elements of this node filtered by name.
   *
   * @param name - Name to filter ancestors by.
   */
  public ancestors(name: XName | string): XElement[];
  public ancestors(name?: XName | string): XElement[] {
    const result: XElement[] = [];
    let current: XObject | null = this.parent;
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

  private get parentContainer(): XContainer | null {
    if (this.parent === null) {
      return null;
    }
    const t = this.parent.nodeType;
    if (t !== "Element" && t !== "Document") {
      return null;
    }
    return this.parent as unknown as XContainer;
  }

  /**
   * Returns the sibling elements that follow this node.
   *
   * @returns An array of sibling {@link XElement} instances after this node.
   *
   * @example
   * ```typescript
   * const parent = new XElement('p', new XElement('a'), new XElement('b'), new XElement('c'));
   * const a = parent.elements()[0];
   * a.elementsAfterSelf(); // [<b>, <c>]
   * ```
   */
  public elementsAfterSelf(): XElement[];
  /**
   * Returns the sibling elements that follow this node, filtered by name.
   *
   * @param name - Name to filter by.
   */
  public elementsAfterSelf(name: XName | string): XElement[];
  public elementsAfterSelf(name?: XName | string): XElement[] {
    const container = this.parentContainer;
    if (container === null) {
      return [];
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    if (idx === -1) {
      return [];
    }
    const result = siblings
      .slice(idx + 1)
      .filter((n): n is XElement => n.nodeType === "Element") as XElement[];
    if (name === undefined) {
      return result;
    }
    const xname = typeof name === "string" ? new XName(name) : name;
    return result.filter((e) => e.name === xname);
  }

  /**
   * Returns the sibling elements that precede this node.
   *
   * @returns An array of sibling {@link XElement} instances before this node.
   */
  public elementsBeforeSelf(): XElement[];
  /**
   * Returns the sibling elements that precede this node, filtered by name.
   *
   * @param name - Name to filter by.
   */
  public elementsBeforeSelf(name: XName | string): XElement[];
  public elementsBeforeSelf(name?: XName | string): XElement[] {
    const container = this.parentContainer;
    if (container === null) {
      return [];
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    if (idx === -1) {
      return [];
    }
    const result = siblings
      .slice(0, idx)
      .filter((n): n is XElement => n.nodeType === "Element") as XElement[];
    if (name === undefined) {
      return result;
    }
    const xname = typeof name === "string" ? new XName(name) : name;
    return result.filter((e) => e.name === xname);
  }

  /**
   * Returns all sibling nodes that precede this node.
   *
   * @returns An array of {@link XNode} instances before this node.
   */
  public nodesBeforeSelf(): XNode[] {
    const container = this.parentContainer;
    if (container === null) {
      return [];
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    if (idx === -1) {
      return [];
    }
    return siblings.slice(0, idx);
  }

  /**
   * Returns all sibling nodes that follow this node.
   *
   * @returns An array of {@link XNode} instances after this node.
   */
  public nodesAfterSelf(): XNode[] {
    const container = this.parentContainer;
    if (container === null) {
      return [];
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    if (idx === -1) {
      return [];
    }
    return siblings.slice(idx + 1);
  }

  /**
   * Gets the previous sibling node, or `null` if this is the first node.
   */
  public get previousNode(): XNode | null {
    const container = this.parentContainer;
    if (container === null) {
      return null;
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return idx > 0 ? siblings[idx - 1] : null;
  }

  /**
   * Gets the next sibling node, or `null` if this is the last node.
   */
  public get nextNode(): XNode | null {
    const container = this.parentContainer;
    if (container === null) {
      return null;
    }
    const siblings = container.nodes();
    const idx = siblings.indexOf(this);
    return idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  }

  /**
   * Removes this node from its parent.
   *
   * @throws Error if this node has no parent.
   */
  public remove(): void {
    if (this.parent === null) {
      throw new Error("The parent is missing.");
    }
    (this.parent as unknown as XContainer).removeChild(this);
    this.parent = null;
  }

  /**
   * Performs a deep structural comparison of this node with another.
   *
   * @remarks
   * Two nodes are deeply equal when they have the same node type and their
   * content (including all descendants and attributes for elements) is equal.
   *
   * @param other - The node to compare against.
   * @returns `true` if the two nodes are structurally identical.
   *
   * @example
   * ```typescript
   * const e1 = XElement.parse('<a x="1"><b/></a>');
   * const e2 = XElement.parse('<a x="1"><b/></a>');
   * e1.deepEquals(e2); // true
   * ```
   */
  public deepEquals(other: XNode): boolean {
    if (this.nodeType === "Element" && other.nodeType === "Element") {
      return (this as unknown as XElement).equals(other as unknown as XElement);
    }
    if (this.nodeType === "Document" && other.nodeType === "Document") {
      return (this as unknown as XDocument).equals(other as unknown as XDocument);
    }
    if (this.nodeType === "Comment" && other.nodeType === "Comment") {
      return (this as unknown as XComment).equals(other as unknown as XComment);
    }
    if (this.nodeType === "Text" && other.nodeType === "Text") {
      return (this as unknown as XText).equals(other as unknown as XText);
    }
    if (this.nodeType === "CDATA" && other.nodeType === "CDATA") {
      return (this as unknown as XCData).equals(other as unknown as XCData);
    }
    if (this.nodeType === "ProcessingInstruction" && other.nodeType === "ProcessingInstruction") {
      return (this as unknown as XProcessingInstruction).equals(
        other as unknown as XProcessingInstruction,
      );
    }
    return false;
  }

  /**
   * Static convenience method for deep structural comparison of two nodes.
   *
   * @param a - First node.
   * @param b - Second node.
   * @returns `true` if the two nodes are structurally identical.
   *
   * @example
   * ```typescript
   * const e1 = XElement.parse('<a x="1"><b/></a>');
   * const e2 = XElement.parse('<a x="1"><b/></a>');
   * XNode.deepEquals(e1, e2); // true
   * ```
   */
  public static deepEquals(a: XNode, b: XNode): boolean {
    return a.deepEquals(b);
  }

  /**
   * Returns the XML string for this node (used by the serialisation pipeline).
   * @internal
   */
  public toStringInternal(): string {
    return this.toString();
  }
}
