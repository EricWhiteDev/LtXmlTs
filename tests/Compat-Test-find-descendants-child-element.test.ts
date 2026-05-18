/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find descendants of a child element".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-descendants-child-element

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find descendants of a child element (conceptual)', () => {
  // COMPAT: docs pair the LINQ side with an XPath query; only LINQ ported.
  it('chains Elements("Paragraph") then Descendants("Text") to extract paragraph-only text', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
  <Paragraph>
    <Text>This is the start of</Text>
  </Paragraph>
  <Comment>
    <Text>This comment isn't part of the paragraph text.</Text>
  </Comment>
  <Paragraph>
    <Annotation Emphasis='true'>
      <Text> a sentence.</Text>
    </Annotation>
  </Paragraph>
  <Paragraph>
    <Text>  This is the second sentence.</Text>
  </Paragraph>
</Root>`);

    // .Elements("Paragraph").Descendants("Text") chains over a sequence —
    // the second axis runs on each element of the first axis's result.
    const paragraphs = root.elements('Paragraph');
    const texts = paragraphs.flatMap((p) => p.descendants('Text'));
    const str1 = texts.map((s) => s.value).join('');

    con.writeLine('Results are identical');
    con.writeLine(str1);

    expectMatches(
      con.text(),
      `Results are identical
This is the start of a sentence.  This is the second sentence.`,
    );
  });
});
