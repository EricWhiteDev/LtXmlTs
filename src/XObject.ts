/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import type { NamespacePrefixInfo } from "./NamespacePrefixInfo.js";
import type { XDocument } from "./XDocument.js";

/**
 * Union type representing the kind of XML node.
 *
 * @remarks
 * Every {@link XObject} carries a `nodeType` property whose value is one of these
 * string literals, or `null` before the node has been fully initialised.
 *
 * @category Class and Type Reference
 */
export type XmlNodeType =
  | "Element"
  | "Text"
  | "Comment"
  | "CDATA"
  | "ProcessingInstruction"
  | "Entity"
  | "Attribute"
  | "Document"
  | null;

/**
 * Abstract base class for every node and attribute in an LtXmlTs XML tree.
 *
 * @remarks
 * `XObject` provides the annotation API for attaching arbitrary metadata to
 * XML objects, and exposes the parent reference and the document accessor.
 * All concrete XML types ({@link XElement}, {@link XAttribute}, {@link XText},
 * etc.) inherit from this class.
 *
 * @example
 * ```typescript
 * const el = new XElement('root');
 * console.log(el.nodeType); // 'Element'
 * ```
 *
 * @category Class and Type Reference
 */
export class XObject {
  protected annotationsArray: unknown[] = [];

  /**
   * The kind of XML node this object represents.
   *
   * @example
   * ```typescript
   * const el = new XElement('root');
   * console.log(el.nodeType); // 'Element'
   * ```
   */
  public nodeType: XmlNodeType = null;

  /**
   * The parent of this object in the XML tree, or `null` if it is a root.
   *
   * @example
   * ```typescript
   * const child = new XElement('child');
   * const parent = new XElement('parent', child);
   * console.log(child.parent === parent); // true
   * ```
   */
  public parent: XObject | null = null;

  /**
   * Namespace-prefix mapping data used during serialisation.
   * @internal
   */
  public namespacePrefixInfo: NamespacePrefixInfo | null = null;

  /**
   * Attaches an arbitrary annotation object to this XML object.
   *
   * @param obj - The annotation object to attach.
   *
   * @example
   * ```typescript
   * class MyMeta { constructor(public tag: string) {} }
   * const el = new XElement('item');
   * el.addAnnotation(new MyMeta('important'));
   * ```
   */
  addAnnotation(obj: unknown): void {
    this.annotationsArray.push(obj);
  }

  /**
   * Returns the first annotation of the specified type, or `null` if none exists.
   *
   * @typeParam T - The annotation class to look up.
   * @param ctor - Constructor of the annotation type to retrieve.
   * @returns The first matching annotation, or `null`.
   *
   * @example
   * ```typescript
   * class MyMeta { constructor(public tag: string) {} }
   * const el = new XElement('item');
   * el.addAnnotation(new MyMeta('important'));
   * const m = el.annotation(MyMeta);
   * console.log(m?.tag); // 'important'
   * ```
   */
  annotation<T>(ctor: new (...args: any[]) => T): T | null {
    for (const item of this.annotationsArray) {
      if (item instanceof ctor) {
        return item as T;
      }
    }
    return null;
  }

  /**
   * Returns all annotations of the specified type.
   *
   * @typeParam T - The annotation class to look up.
   * @param ctor - Constructor of the annotation type to retrieve.
   * @returns An array of matching annotations (may be empty).
   */
  annotations<T>(ctor: new (...args: any[]) => T): T[] {
    return this.annotationsArray.filter((item) => item instanceof ctor) as T[];
  }

  /**
   * Removes annotations from this object.
   *
   * @remarks
   * When called with no arguments, all annotations are removed. When called
   * with a constructor, only annotations of that type are removed.
   *
   * @example
   * ```typescript
   * class MyMeta { constructor(public tag: string) {} }
   * const el = new XElement('item');
   * el.addAnnotation(new MyMeta('important'));
   * el.removeAnnotations(MyMeta);  // removes only MyMeta annotations
   * el.removeAnnotations();        // removes everything
   * ```
   */
  removeAnnotations(): void;
  removeAnnotations<T>(ctor: new (...args: any[]) => T): void;
  removeAnnotations<T>(ctor?: new (...args: any[]) => T): void {
    if (ctor === undefined) {
      this.annotationsArray = [];
    } else {
      this.annotationsArray = this.annotationsArray.filter(
        (item) => (item as { constructor: unknown }).constructor !== ctor,
      );
    }
  }

  /**
   * Gets the {@link XDocument} that contains this object, or `null` if the
   * object is not part of a document tree.
   *
   * @example
   * ```typescript
   * const doc = new XDocument(new XElement('root', new XElement('child')));
   * const child = doc.root!.elements()[0];
   * console.log(child.document === doc); // true
   * ```
   */
  public get document(): XDocument | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: XObject = this;
    while (current.parent !== null) {
      current = current.parent;
    }
    // Use nodeType check to avoid needing a runtime import of XDocument
    // (which would create a deep circular dependency chain)
    return current.nodeType === "Document" ? (current as unknown as XDocument) : null;
  }
}
