/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

/**
 * LtXmlTs -- LINQ to XML for TypeScript.
 *
 * A TypeScript port of .NET's System.Xml.Linq, providing a rich XML object model
 * with fluent querying, functional tree construction, and round-trip serialization.
 *
 * @packageDocumentation
 */

export type { XmlNodeType } from "./XObject.js";
export { XObject } from "./XObject.js";
export { XNode } from "./XNode.js";
export { XComment } from "./XComment.js";
export { XText } from "./XText.js";
export { XCData } from "./XCData.js";
export { XProcessingInstruction } from "./XProcessingInstruction.js";
export { XContainer } from "./XContainer.js";
export { XAttribute } from "./XAttribute.js";
export { XElement } from "./XElement.js";
export { XDeclaration } from "./XDeclaration.js";
export { XDocument } from "./XDocument.js";
export { XNamespace } from "./XNamespace.js";
export { NamespacePrefixPair, NamespacePrefixInfo } from "./NamespacePrefixInfo.js";
export { XName } from "./XName.js";
export { XmlParseError } from "./SaxParser.js";
export {
  XSequence,
  xseq,
  ancestors,
  ancestorsAndSelf,
  attributes,
  descendants,
  descendantsAndSelf,
  descendantNodes,
  elements,
  nodes,
  inDocumentOrder,
  remove,
} from "./XSequence.js";
