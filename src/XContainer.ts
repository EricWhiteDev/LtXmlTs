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

/**
 * Abstract base class for XML nodes that can contain child nodes.
 *
 * @remarks
 * {@link XElement} and {@link XDocument} extend `XContainer`. It provides
 * the child-node collection, element and descendant queries, and content
 * manipulation methods (add, remove, replace).
 */
export class XContainer extends XNode {
  /**
   * Internal backing array for child nodes.
   * @internal
   */
  protected nodesArray: XNode[] = [];

  /**
   * Returns a shallow copy of this container's child nodes.
   *
   * @returns A new array containing all direct child {@link XNode} instances.
   */
  public nodes(): XNode[] {
    return [...this.nodesArray];
  }

  /**
   * Gets the first child node, or `null` if the container is empty.
   */
  public get firstNode(): XNode | null {
    return this.nodesArray.length > 0 ? this.nodesArray[0] : null;
  }

  /**
   * Gets the last child node, or `null` if the container is empty.
   */
  public get lastNode(): XNode | null {
    return this.nodesArray.length > 0 ? this.nodesArray[this.nodesArray.length - 1] : null;
  }

  /**
   * Adds multiple content items to this container.
   * @internal
   */
  protected addContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addContentObject(item);
    }
  }

  /**
   * Adds a single content item to this container, handling type dispatch.
   * @internal
   */
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

  /**
   * Inserts content items into this container (overridden by XDocument for validation).
   * @internal
   */
  protected insertContentItems(...items: unknown[]): void {
    this.addContentList(...items);
  }

  /**
   * Inserts content immediately after an existing child node.
   *
   * @param child - The reference child node.
   * @param content - Content to insert after the child.
   */
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

  /**
   * Appends content as children of this container.
   *
   * @remarks
   * Content rules:
   * - {@link XElement} and other {@link XNode} subclasses are added as child nodes.
   * - Strings are wrapped in {@link XText}.
   * - Arrays are recursively unpacked.
   * - {@link XAttribute} objects passed here are silently ignored; pass
   *   attributes to the {@link XElement} constructor or use
   *   {@link XElement.setAttributeValue} instead.
   * - If a node already has a parent, it is cloned before being added.
   *
   * @param content - Nodes, strings, or arrays to add.
   */
  public add(...content: unknown[]): void {
    this.insertContentItems(...content);
  }

  /**
   * Replaces all child nodes with the specified content.
   *
   * @param content - New content to use as children.
   */
  public replaceNodes(...content: unknown[]): void {
    for (const node of this.nodesArray) {
      node.parent = null;
    }
    this.nodesArray = [];
    this.insertContentItems(...content);
  }

  /**
   * Removes all child nodes from this container.
   */
  public removeNodes(): void {
    this.replaceNodes();
  }

  /**
   * Returns the child elements of this container.
   *
   * @returns An array of direct child {@link XElement} instances.
   */
  public elements(): XElement[];
  /**
   * Returns the child elements of this container filtered by name.
   *
   * @param name - Name to filter by.
   */
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

  /**
   * Returns the first child element with the specified name, or `null`.
   *
   * @param name - The element name to match.
   * @returns The first matching child {@link XElement}, or `null`.
   */
  public element(name: XName | string): XElement | null {
    const xname = typeof name === "string" ? new XName(name) : name;
    return (
      this.nodesArray.find(
        (n): n is XElement => n.nodeType === "Element" && (n as unknown as XElement).name === xname,
      ) ?? null
    );
  }

  /**
   * Returns all descendant nodes of this container in document order.
   *
   * @returns A flat array of all descendant {@link XNode} instances.
   */
  public descendantNodes(): XNode[] {
    const tempArray: XNode[] = [];
    for (const node of this.nodesArray) {
      this.addSelfAndDescendantsToTempArray(tempArray, node);
    }
    return tempArray;
  }

  /**
   * Recursively collects a node and all its descendants into an array.
   * @internal
   */
  protected addSelfAndDescendantsToTempArray(tempArray: XNode[], node: XNode): void {
    tempArray.push(node);
    if (node.nodeType === "Element" || node.nodeType === "Document") {
      const container = node as unknown as XContainer;
      for (const child of container.nodesArray) {
        this.addSelfAndDescendantsToTempArray(tempArray, child);
      }
    }
  }

  /**
   * Returns all descendant elements of this container in document order.
   *
   * @returns An array of descendant {@link XElement} instances.
   */
  public descendants(): XElement[];
  /**
   * Returns all descendant elements of this container in document order, filtered by name.
   *
   * @param name - Name to filter by.
   */
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

  /**
   * Recursively collects an element and its descendant elements into an array.
   * @internal
   */
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

  /**
   * Inserts content as the first children of this container.
   *
   * @param content - Nodes, strings, or arrays to prepend.
   */
  public addFirst(...content: unknown[]): void {
    const copy = [...this.nodesArray];
    this.nodesArray = copy; // let XDocument see existing nodes for constraint checks
    const priorLen = this.nodesArray.length;
    this.insertContentItems(...content);
    const newNodes = this.nodesArray.splice(priorLen);
    this.nodesArray = [...newNodes, ...copy];
  }

  /**
   * Inserts content immediately before an existing child node.
   *
   * @param child - The reference child node.
   * @param content - Content to insert before the child.
   */
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

  /**
   * Replaces an existing child node with the specified content.
   *
   * @param child - The child node to replace.
   * @param content - Content that replaces the child.
   */
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

  /**
   * Removes a specific child node from this container.
   *
   * @param child - The child node to remove.
   */
  public removeChild(child: XNode): void {
    const idx = this.nodesArray.indexOf(child);
    this.nodesArray = [...this.nodesArray.slice(0, idx), ...this.nodesArray.slice(idx + 1)];
  }

  /**
   * Compares this container's child nodes with another container's for
   * structural equality.
   *
   * @param other - The container to compare against.
   * @returns `true` if both containers have the same child nodes in order.
   */
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
