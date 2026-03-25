/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import * as fs from 'fs';
import * as sax from 'sax';
import {
  XDocument,
  XElement,
  XAttribute,
  XComment,
  XText,
  XCData,
  XProcessingInstruction,
  XDeclaration,
  XName,
  XNamespace,
  XNode,
} from './index.js';

export class XmlParseError extends Error {
  public readonly line?: number;
  public readonly column?: number;
  public readonly filePath?: string;

  constructor(message: string, line?: number, column?: number, filePath?: string) {
    super(message);
    this.name = 'XmlParseError';
    this.line = line;
    this.column = column;
    this.filePath = filePath;
  }
}

class SaxParser {
  private readonly saxParser: sax.SAXParser = sax.parser(true, { xmlns: true });
  private readonly elementStack: XElement[] = [];
  private readonly docLevelNodes: XNode[] = [];
  private declaration: XDeclaration | null = null;
  private error: XmlParseError | null = null;

  public parseDocument(xml: string): XDocument {
    this.runParser(xml);
    if (this.error !== null) throw this.error;
    if (this.declaration !== null) {
      return new XDocument(this.declaration, ...this.docLevelNodes);
    }
    return new XDocument(...this.docLevelNodes);
  }

  public parseElement(xml: string): XElement {
    this.runParser(xml);
    if (this.error !== null) throw this.error;
    const root = this.docLevelNodes.find((n): n is XElement => n instanceof XElement);
    if (root === undefined) throw new XmlParseError('No root element found');
    return root;
  }

  public parseDocumentFromFile(filePath: string): XDocument {
    const xml = fs.readFileSync(filePath, 'utf8');
    try {
      return this.parseDocument(xml);
    } catch (e) {
      if (e instanceof XmlParseError)
        throw new XmlParseError(e.message, e.line, e.column, filePath);
      throw e;
    }
  }

  public parseElementFromFile(filePath: string): XElement {
    const xml = fs.readFileSync(filePath, 'utf8');
    try {
      return this.parseElement(xml);
    } catch (e) {
      if (e instanceof XmlParseError)
        throw new XmlParseError(e.message, e.line, e.column, filePath);
      throw e;
    }
  }

  public async parseDocumentFromFileAsync(filePath: string): Promise<XDocument> {
    const xml = await fs.promises.readFile(filePath, 'utf8');
    try {
      return this.parseDocument(xml);
    } catch (e) {
      if (e instanceof XmlParseError)
        throw new XmlParseError(e.message, e.line, e.column, filePath);
      throw e;
    }
  }

  public async parseElementFromFileAsync(filePath: string): Promise<XElement> {
    const xml = await fs.promises.readFile(filePath, 'utf8');
    try {
      return this.parseElement(xml);
    } catch (e) {
      if (e instanceof XmlParseError)
        throw new XmlParseError(e.message, e.line, e.column, filePath);
      throw e;
    }
  }

  private runParser(xml: string): void {
    this.saxParser.onopentag = (tag: sax.Tag | sax.QualifiedTag) => {
      if (this.error !== null) return;
      const qtag = tag as sax.QualifiedTag;
      const xname = qtag.uri !== ''
        ? XName.get(`{${qtag.uri}}${qtag.local}`)
        : XName.get(qtag.local);

      const attrs: XAttribute[] = [];
      for (const [attrKey, attr] of Object.entries(qtag.attributes)) {
        const qattr = attr as sax.QualifiedAttribute;
        if (attrKey === 'xmlns' || attrKey.startsWith('xmlns:')) {
          const localName = attrKey === 'xmlns' ? 'xmlns' : qattr.local;
          attrs.push(new XAttribute(XNamespace.xmlns.getName(localName), qattr.value));
        } else {
          const axname = qattr.uri !== ''
            ? XName.get(`{${qattr.uri}}${qattr.local}`)
            : XName.get(qattr.local);
          attrs.push(new XAttribute(axname, qattr.value));
        }
      }

      const element = new XElement(xname, ...attrs);
      this.elementStack.push(element);
    };

    this.saxParser.onclosetag = (_name: string) => {
      if (this.error !== null) return;
      const element = this.elementStack.pop();
      if (element !== undefined) this.addNode(element);
    };

    this.saxParser.ontext = (text: string) => {
      if (this.error !== null) return;
      if (/^\s*$/.test(text)) return;
      this.addNode(new XText(text));
    };

    this.saxParser.oncdata = (cdata: string) => {
      if (this.error !== null) return;
      this.addNode(new XCData(cdata));
    };

    this.saxParser.oncomment = (comment: string) => {
      if (this.error !== null) return;
      this.addNode(new XComment(comment));
    };

    this.saxParser.onprocessinginstruction = (pi: { name: string; body: string }) => {
      if (this.error !== null) return;
      if (pi.name === 'xml' && this.elementStack.length === 0) {
        const version = pi.body.match(/version=['"]([^'"]+)['"]/)?.[1] ?? '1.0';
        const encoding = pi.body.match(/encoding=['"]([^'"]+)['"]/)?.[1] ?? '';
        const standalone = pi.body.match(/standalone=['"]([^'"]+)['"]/)?.[1] ?? '';
        this.declaration = new XDeclaration(version, encoding, standalone);
      } else {
        this.addNode(new XProcessingInstruction(pi.name, pi.body.trim()));
      }
    };

    this.saxParser.onerror = (err: Error) => {
      if (this.error === null) {
        this.error = new XmlParseError(
          err.message,
          this.saxParser.line,
          this.saxParser.column,
        );
      }
      this.saxParser.resume();
    };

    try {
      this.saxParser.write(xml);
      this.saxParser.close();
    } catch (thrown) {
      if (this.error === null) {
        const e = thrown as Error;
        this.error = new XmlParseError(
          e.message,
          this.saxParser.line,
          this.saxParser.column,
        );
      }
    }
  }

  private addNode(node: XNode): void {
    if (this.elementStack.length > 0) {
      this.elementStack[this.elementStack.length - 1].add(node);
    } else {
      this.docLevelNodes.push(node);
    }
  }
}

export { SaxParser };
