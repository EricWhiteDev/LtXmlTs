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

export class XSequence<T extends XNode | XAttribute> {
  private readonly items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  public toArray(): T[] {
    return [...this.items];
  }

  public ancestors(): XSequence<XElement>;
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

  public ancestorsAndSelf(): XSequence<XElement>;
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

  public attributes(): XSequence<XAttribute>;
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

  public descendants(): XSequence<XElement>;
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

  public descendantsAndSelf(): XSequence<XElement>;
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

  public descendantNodes(): XSequence<XNode> {
    const result: XNode[] = [];
    for (const item of this.items) {
      if (item instanceof XElement) {
        result.push(...item.descendantNodes());
      }
    }
    return new XSequence(result);
  }

  public elements(): XSequence<XElement>;
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

  public nodes(): XSequence<XNode> {
    const result: XNode[] = [];
    for (const item of this.items) {
      if (item instanceof XContainer) {
        result.push(...item.nodes());
      }
    }
    return new XSequence(result);
  }

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

  public remove(): void {
    const snapshot = [...this.items];
    for (const item of snapshot) {
      item.remove();
    }
  }
}

export function xseq<T extends XNode | XAttribute>(items: T[]): XSequence<T> {
  return new XSequence(items);
}

// Standalone functions

export function ancestors(nodes: XNode[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(nodes).ancestors().toArray()
    : xseq(nodes).ancestors(name).toArray();
}

export function ancestorsAndSelf(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).ancestorsAndSelf().toArray()
    : xseq(elements).ancestorsAndSelf(name).toArray();
}

export function attributes(elements: XElement[], name?: XName | string): XAttribute[] {
  return name === undefined
    ? xseq(elements).attributes().toArray()
    : xseq(elements).attributes(name).toArray();
}

export function descendants(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).descendants().toArray()
    : xseq(elements).descendants(name).toArray();
}

export function descendantsAndSelf(elements: XElement[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(elements).descendantsAndSelf().toArray()
    : xseq(elements).descendantsAndSelf(name).toArray();
}

export function descendantNodes(elements: XElement[]): XNode[] {
  return xseq(elements).descendantNodes().toArray();
}

export function elements(nodes: XNode[], name?: XName | string): XElement[] {
  return name === undefined
    ? xseq(nodes).elements().toArray()
    : xseq(nodes).elements(name).toArray();
}

export function nodes(elements: XElement[]): XNode[] {
  return xseq(elements).nodes().toArray();
}

export function inDocumentOrder<T extends XNode | XAttribute>(items: T[]): T[] {
  return xseq(items).inDocumentOrder().toArray();
}

export function remove(items: Array<XNode | XAttribute>): void {
  xseq(items).remove();
}
