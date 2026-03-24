/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { XContainer } from './XContainer.js';
import { XDeclaration } from './XDeclaration.js';
import { XElement } from './XElement.js';
import { XComment } from './XComment.js';
import { XText } from './XText.js';
import { XEntity } from './XEntity.js';
import { XCData } from './XCData.js';
import { XProcessingInstruction } from './XProcessingInstruction.js';
import { XNode } from './XNode.js';
import { XAttribute } from './XAttribute.js';
import { indentXml } from './XmlUtils.js';
import { SaxParser } from './SaxParser.js';

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

  public toStringInternal(): string {
    const decl = this.declaration !== null ? this.declaration.toString() : '';
    return decl + this.nodesArray.map(n => n.toStringInternal()).join('');
  }

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

  public toStringWithIndentation(): string {
    return indentXml(this.toString());
  }

  public static parse(xml: string): XDocument {
    return new SaxParser().parseDocument(xml);
  }
}
