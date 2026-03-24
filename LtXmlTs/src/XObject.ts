/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import type { NamespacePrefixInfo } from './NamespacePrefixInfo.js';
import type { XDocument } from './XDocument.js';

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
    // Use nodeType check to avoid needing a runtime import of XDocument
    // (which would create a deep circular dependency chain)
    return current.nodeType === 'Document' ? current as unknown as XDocument : null;
  }
}
