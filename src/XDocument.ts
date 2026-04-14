/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XContainer } from "./XContainer.js";
import { XDeclaration } from "./XDeclaration.js";
import { XElement } from "./XElement.js";
import { XComment } from "./XComment.js";
import { XText } from "./XText.js";
import { XCData } from "./XCData.js";
import { XProcessingInstruction } from "./XProcessingInstruction.js";
import { XNode } from "./XNode.js";
import { XAttribute } from "./XAttribute.js";
import { indentXml } from "./XmlUtils.js";
import { SaxParser } from "./SaxParser.js";

/**
 * Represents a complete XML document.
 *
 * @remarks
 * An `XDocument` may contain at most one {@link XElement} (the root).
 * {@link XAttribute} and {@link XCData} are not valid document content and
 * will throw. Non-whitespace string content will also throw.
 *
 * @example
 * ```typescript
 * const doc = new XDocument(
 *   new XDeclaration('1.0', 'UTF-8', 'yes'),
 *   new XElement('root', new XElement('child')),
 * );
 * doc.declaration?.version; // '1.0'
 * doc.root?.name.localName; // 'root'
 *
 * const doc = XDocument.parse("<?xml version='1.0'?><root/>");
 * ```
 *
 * @category Class and Type Reference
 */
export class XDocument extends XContainer {
  /**
   * The XML declaration for this document, or `null` if none was specified.
   */
  public readonly declaration: XDeclaration | null;

  /**
   * Creates a new empty XDocument.
   *
   * @remarks
   * - `new XDocument()` creates an empty document.
   * - `new XDocument(declaration)` creates a document with an XML declaration.
   * - `new XDocument(other)` deep-clones an existing document.
   * - `new XDocument(...content)` creates a document with content nodes.
   * - `new XDocument(declaration, ...content)` creates a document with both.
   */
  constructor();
  /**
   * Creates a new XDocument with an XML declaration.
   *
   * @param declaration - The XML declaration.
   */
  constructor(declaration: XDeclaration);
  /**
   * Deep-clones an existing XDocument.
   *
   * @param other - The document to clone.
   */
  constructor(other: XDocument);
  /**
   * Creates a new XDocument with the specified content.
   *
   * @param content - Root element, comments, processing instructions, or
   *   whitespace-only strings.
   */
  constructor(...content: unknown[]);
  /**
   * Creates a new XDocument with an XML declaration and content.
   *
   * @param declaration - The XML declaration.
   * @param content - Root element, comments, processing instructions, or
   *   whitespace-only strings.
   */
  constructor(declaration: XDeclaration, ...content: unknown[]);
  constructor(firstOrContent?: XDeclaration | XDocument | unknown, ...rest: unknown[]) {
    super();
    this.nodeType = "Document";
    if (firstOrContent instanceof XDocument) {
      const other = firstOrContent;
      this.declaration = other.declaration !== null ? new XDeclaration(other.declaration) : null;
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

  /**
   * Compares this document with another for structural equality, including
   * the declaration and all child nodes.
   *
   * @param other - The document to compare against.
   * @returns `true` if the documents are structurally identical.
   */
  public override equals(other: XDocument): boolean {
    if (this.declaration === null && other.declaration !== null) {
      return false;
    }
    if (this.declaration !== null && other.declaration === null) {
      return false;
    }
    if (this.declaration !== null && other.declaration !== null) {
      if (!this.declaration.equals(other.declaration)) {
        return false;
      }
    }
    return super.equals(other);
  }

  /**
   * Gets the root element of this document, or `null` if there is none.
   */
  public get root(): XElement | null {
    return (this.nodesArray.find((n) => n instanceof XElement) as XElement) ?? null;
  }

  /**
   * Overrides content insertion to enforce document content rules.
   * @internal
   */
  protected override insertContentItems(...items: unknown[]): void {
    this.addDocumentContentList(...items);
  }

  /**
   * Adds multiple document content items with validation.
   * @internal
   */
  protected addDocumentContentList(...items: unknown[]): void {
    for (const item of items) {
      this.addDocumentContentObject(item);
    }
  }

  /**
   * Adds a single document content object with type validation.
   * @internal
   */
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
      throw new Error("XAttribute is not valid content for an XDocument.");
    }
    if (content instanceof XCData) {
      throw new Error("XCData is not valid content for an XDocument.");
    }
    if (typeof content === "string") {
      if (/\S/.test(content)) {
        throw new Error("Non-whitespace string content is not valid for an XDocument.");
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
        throw new Error("XText with non-whitespace content is not valid for an XDocument.");
      }
      if (content instanceof XElement && this.nodesArray.some((n) => n instanceof XElement)) {
        throw new Error("An XDocument may contain only one XElement.");
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

  /**
   * Produces the XML string for this document (used by the serialisation pipeline).
   * @internal
   */
  public toStringInternal(): string {
    const decl = this.declaration !== null ? this.declaration.toString() : "";
    return decl + this.nodesArray.map((n) => n.toStringInternal()).join("");
  }

  /**
   * Serialises this document to an XML string.
   *
   * @returns The XML string representation, including the declaration if present.
   */
  public toString(): string {
    if (this.root !== null) {
      XElement.populateNamespacePrefixInfo(this.root);
    }
    try {
      return this.toStringInternal();
    } finally {
      if (this.root !== null) {
        XElement.cleanupAfterSerialization(this.root);
      }
    }
  }

  /**
   * Serialises this document to an indented (pretty-printed) XML string.
   *
   * @returns The indented XML string.
   */
  public toStringWithIndentation(): string {
    return indentXml(this.toString());
  }

  /**
   * Parses an XML string into an {@link XDocument}.
   *
   * @param xml - The XML string to parse.
   * @returns The parsed document.
   *
   * @example
   * ```typescript
   * const doc = XDocument.parse("<?xml version='1.0'?><root/>");
   * ```
   */
  public static parse(xml: string): XDocument {
    return new SaxParser().parseDocument(xml);
  }

  /**
   * Loads an XML file synchronously and parses it into an {@link XDocument}.
   *
   * @param filePath - Path to the XML file.
   * @returns The parsed document.
   */
  public static load(filePath: string): XDocument {
    return new SaxParser().parseDocumentFromFile(filePath);
  }

  /**
   * Loads an XML file asynchronously and parses it into an {@link XDocument}.
   *
   * @param filePath - Path to the XML file.
   * @returns A promise that resolves to the parsed document.
   */
  public static async loadAsync(filePath: string): Promise<XDocument> {
    return new SaxParser().parseDocumentFromFileAsync(filePath);
  }
}
