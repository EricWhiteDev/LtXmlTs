/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import type { XObject } from "./XObject.js";
import { XNode } from "./XNode.js";
import { XContainer } from "./XContainer.js";
import { XElement } from "./XElement.js";
import { XAttribute } from "./XAttribute.js";
import { XName } from "./XName.js";

function buildDocumentOrderMap(root: XObject): Map<XNode | XAttribute, number> {
  const map = new Map<XNode | XAttribute, number>();
  let index = 0;

  function visit(node: XNode): void {
    map.set(node, index++);
    if (node instanceof XElement) {
      for (const attr of node.attributes()) {
        map.set(attr, index++);
      }
    }
    if (node instanceof XContainer) {
      for (const child of node.nodes()) {
        visit(child);
      }
    }
  }

  if (root instanceof XNode) {
    visit(root);
  }
  return map;
}

function findRoot(item: XNode | XAttribute): XObject {
  let current: XObject = item;
  while (current.parent !== null) {
    current = current.parent;
  }
  return current;
}

/**
 * A LINQ-style sequence wrapper for arrays of XML objects.
 *
 * @remarks
 * Wraps an array of {@link XNode} or {@link XAttribute} items and provides
 * chainable query methods (ancestors, descendants, elements, etc.) that mirror
 * the .NET LINQ to XML extension methods.
 *
 * @typeParam T - The element type of the sequence.
 *
 * @example
 * ```typescript
 * const root = XElement.parse('<catalog><book id="1"><title>A</title></book><book id="2"><title>B</title></book></catalog>');
 * const titles = xseq(root.elements("book")).elements("title").toArray().map(el => el.value);
 * // ["A", "B"]
 * ```
 *
 * @category Class and Type Reference
 */
export class XSequence<T extends XNode | XAttribute> {
  private readonly items: T[];

  /**
   * @param items - The array of items to wrap.
   */
  constructor(items: T[]) {
    this.items = items;
  }

  /** Returns an iterator over the items in this sequence. */
  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  /**
   * Materializes the sequence into a plain array.
   *
   * @returns A new array containing all items.
   */
  public toArray(): T[] {
    return [...this.items];
  }

  /**
   * Returns the ancestors of every node in this sequence.
   *
   * @returns A sequence of ancestor elements.
   */
  public ancestors(): XSequence<XElement>;
  /**
   * Returns the ancestors of every node in this sequence, filtered by name.
   *
   * @param name - Name filter.
   */
  public ancestors(name: XName | string): XSequence<XElement>;
  public ancestors(name?: XName | string): XSequence<XElement> {
    const result: XElement[] = [];
    for (const item of this.items) {
      if (item instanceof XNode) {
        const ancs = name === undefined ? item.ancestors() : item.ancestors(name);
        result.push(...ancs);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns each element in this sequence together with its ancestors.
   *
   * @returns A sequence of elements.
   */
  public ancestorsAndSelf(): XSequence<XElement>;
  /**
   * Returns each element in this sequence together with its ancestors, filtered by name.
   *
   * @param name - Name filter.
   */
  public ancestorsAndSelf(name: XName | string): XSequence<XElement>;
  public ancestorsAndSelf(name?: XName | string): XSequence<XElement> {
    const result: XElement[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        const ancs = name === undefined ? item.ancestorsAndSelf() : item.ancestorsAndSelf(name);
        result.push(...ancs);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns the attributes of every element in this sequence.
   *
   * @returns A sequence of attributes.
   */
  public attributes(): XSequence<XAttribute>;
  /**
   * Returns the attributes of every element in this sequence, filtered by name.
   *
   * @param name - Name filter.
   */
  public attributes(name: XName | string): XSequence<XAttribute>;
  public attributes(name?: XName | string): XSequence<XAttribute> {
    const result: XAttribute[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        const attrs = name === undefined ? item.attributes() : item.attributes(name);
        result.push(...attrs);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns the descendants of every element in this sequence.
   *
   * @returns A sequence of descendant elements.
   */
  public descendants(): XSequence<XElement>;
  /**
   * Returns the descendants of every element in this sequence, filtered by name.
   *
   * @param name - Name filter.
   */
  public descendants(name: XName | string): XSequence<XElement>;
  public descendants(name?: XName | string): XSequence<XElement> {
    const result: XElement[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        const descs = name === undefined ? item.descendants() : item.descendants(name);
        result.push(...descs);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns each element in this sequence together with its descendants.
   *
   * @returns A sequence of elements.
   */
  public descendantsAndSelf(): XSequence<XElement>;
  /**
   * Returns each element in this sequence together with its descendants, filtered by name.
   *
   * @param name - Name filter.
   */
  public descendantsAndSelf(name: XName | string): XSequence<XElement>;
  public descendantsAndSelf(name?: XName | string): XSequence<XElement> {
    const result: XElement[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        const descs =
          name === undefined ? item.descendantsAndSelf() : item.descendantsAndSelf(name);
        result.push(...descs);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns all descendant nodes (of any type) of every element in this sequence.
   *
   * @returns A sequence of descendant nodes.
   */
  public descendantNodes(): XSequence<XNode> {
    const result: XNode[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        result.push(...item.descendantNodes());
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns the direct child elements of every container in this sequence.
   *
   * @returns A sequence of child elements.
   */
  public elements(): XSequence<XElement>;
  /**
   * Returns the direct child elements of every container in this sequence, filtered by name.
   *
   * @param name - Name filter.
   */
  public elements(name: XName | string): XSequence<XElement>;
  public elements(name?: XName | string): XSequence<XElement> {
    const result: XElement[] = [];
    for (const item of this.items) {
      if (item instanceof XContainer) {
        const els = name === undefined ? item.elements() : item.elements(name);
        result.push(...els);
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns all direct child nodes of every container in this sequence.
   *
   * @returns A sequence of child nodes.
   */
  public nodes(): XSequence<XNode> {
    const result: XNode[] = [];
    for (const item of this.items) {
      if (item instanceof XContainer) {
        result.push(...item.nodes());
      }
    }
    return new XSequence(result);
  }

  /**
   * Returns the items sorted in document order.
   *
   * @returns A new sequence with items in document order.
   */
  public inDocumentOrder(): XSequence<T> {
    if (this.items.length === 0) {
      return new XSequence<T>([]);
    }
    const root = findRoot(this.items[0]);
    const posMap = buildDocumentOrderMap(root);
    const sorted = [...this.items].sort((a, b) => {
      const pa = posMap.get(a) ?? Infinity;
      const pb = posMap.get(b) ?? Infinity;
      return pa - pb;
    });
    return new XSequence(sorted);
  }

  /**
   * Removes all items in this sequence from their parents.
   */
  public remove(): void {
    const snapshot = [...this.items];
    for (const item of snapshot) {
      item.remove();
    }
  }
}

/**
 * Wraps an array of XML objects in an {@link XSequence} for fluent querying.
 *
 * @typeParam T - The element type.
 * @param items - The array to wrap.
 * @returns A new {@link XSequence}.
 *
 * @example
 * ```typescript
 * const titles = xseq(root.elements("book")).elements("title").toArray();
 * ```
 *
 * @category Array Extension Methods
 */
export function xseq<T extends XNode | XAttribute>(items: T[]): XSequence<T> {
  return new XSequence(items);
}

// Standalone functions

/**
 * Returns the ancestors of every node in the array, optionally filtered by name.
 *
 * @param nodes - The source nodes.
 * @param name - Optional name filter.
 * @returns An array of ancestor elements.
 *
 * @category Array Extension Methods
 */
export function ancestors(nodes: XNode[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(nodes).ancestors().toArray()
    : xseq(nodes).ancestors(name).toArray();
}

/**
 * Returns each element together with its ancestors, optionally filtered by name.
 *
 * @param elements - The source elements.
 * @param name - Optional name filter.
 * @returns An array of elements.
 *
 * @category Array Extension Methods
 */
export function ancestorsAndSelf(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).ancestorsAndSelf().toArray()
    : xseq(elements).ancestorsAndSelf(name).toArray();
}

/**
 * Returns the attributes of every element in the array, optionally filtered by name.
 *
 * @param elements - The source elements.
 * @param name - Optional name filter.
 * @returns An array of attributes.
 *
 * @category Array Extension Methods
 */
export function attributes(elements: XElement[], name?: XName | string): XAttribute[] {
  return name === undefined
    ? xseq(elements).attributes().toArray()
    : xseq(elements).attributes(name).toArray();
}

/**
 * Returns the descendants of every element in the array, optionally filtered by name.
 *
 * @param elements - The source elements.
 * @param name - Optional name filter.
 * @returns An array of descendant elements.
 *
 * @category Array Extension Methods
 */
export function descendants(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).descendants().toArray()
    : xseq(elements).descendants(name).toArray();
}

/**
 * Returns each element together with its descendants, optionally filtered by name.
 *
 * @param elements - The source elements.
 * @param name - Optional name filter.
 * @returns An array of elements.
 *
 * @category Array Extension Methods
 */
export function descendantsAndSelf(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).descendantsAndSelf().toArray()
    : xseq(elements).descendantsAndSelf(name).toArray();
}

/**
 * Returns all descendant nodes of every element in the array.
 *
 * @param elements - The source elements.
 * @returns An array of descendant nodes.
 *
 * @category Array Extension Methods
 */
export function descendantNodes(elements: XElement[]): XNode[] {
  return xseq(elements).descendantNodes().toArray();
}

/**
 * Returns the direct child elements of every node in the array, optionally filtered by name.
 *
 * @param nodes - The source nodes.
 * @param name - Optional name filter.
 * @returns An array of child elements.
 *
 * @category Array Extension Methods
 */
export function elements(nodes: XNode[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(nodes).elements().toArray()
    : xseq(nodes).elements(name).toArray();
}

/**
 * Returns all direct child nodes of every element in the array.
 *
 * @param elements - The source elements.
 * @returns An array of child nodes.
 *
 * @category Array Extension Methods
 */
export function nodes(elements: XElement[]): XNode[] {
  return xseq(elements).nodes().toArray();
}

/**
 * Returns the items sorted in document order.
 *
 * @typeParam T - The element type.
 * @param items - The items to sort.
 * @returns A new array in document order.
 *
 * @category Array Extension Methods
 */
export function inDocumentOrder<T extends XNode | XAttribute>(items: T[]): T[] {
  return xseq(items).inDocumentOrder().toArray();
}

/**
 * Removes all items in the array from their parents.
 *
 * @param items - The nodes or attributes to remove.
 *
 * @example
 * ```typescript
 * remove(root.descendants('book'));
 * ```
 *
 * @category Array Extension Methods
 */
export function remove(items: Array<XNode | XAttribute>): void {
  xseq(items).remove();
}
