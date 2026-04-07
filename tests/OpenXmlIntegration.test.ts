/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// OpenXmlIntegration.test.ts
// This module contains unit tests that are there for the purpose of testing some of the
// more interesting Open XML markup manipulation tests.

import { describe, it, expect } from 'vitest';
import { XElement, XAttribute, XNamespace, xseq } from 'ltxmlts';

const w = XNamespace.get('http://schemas.openxmlformats.org/wordprocessingml/2006/main');
const xmlNs = XNamespace.get('http://www.w3.org/XML/1998/namespace');

const inputXml = `\
<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:pPr>
    <w:pStyle w:val="ListParagraph"/>
    <w:spacing w:before="60" w:after="100" w:line="240" w:lineRule="auto"/>
    <w:contextualSpacing w:val="0"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/>
      <w:bCs/>
    </w:rPr>
    <w:t>123</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
    </w:rPr>
    <w:t xml:space="preserve"> abc </w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/>
      <w:bCs/>
    </w:rPr>
    <w:t>456</w:t>
  </w:r>
</w:p>`;

const characterLevelExpected = `<w:p xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>
  <w:pPr>
    <w:pStyle w:val='ListParagraph' />
    <w:spacing w:before='60' w:after='100' w:line='240' w:lineRule='auto' />
    <w:contextualSpacing w:val='0' />
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>1</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>2</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>3</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
    </w:rPr>
    <w:t xml:space='preserve'> </w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
    </w:rPr>
    <w:t>a</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
    </w:rPr>
    <w:t>b</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
    </w:rPr>
    <w:t>c</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
    </w:rPr>
    <w:t xml:space='preserve'> </w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>4</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>5</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii='Times New Roman' w:eastAsia='Times New Roman' w:hAnsi='Times New Roman' w:cs='Times New Roman' />
      <w:b />
      <w:bCs />
    </w:rPr>
    <w:t>6</w:t>
  </w:r>
</w:p>`;

function coalesceRunsInParagraph(para: XElement): XElement {
  const charRuns = para.elements(w + 'r');
  const groups = xseq(charRuns).groupAdjacent(
    run => run.element(w + 'rPr')?.toString() ?? ''
  );

  const coalescedRuns: XElement[] = groups.map(group => {
    const runs = group.items.toArray() as XElement[];
    const rPr = runs[0].element(w + 'rPr');
    const text = runs.map(r => r.element(w + 't')!.value).join('');
    const tElement = text.startsWith(' ') || text.endsWith(' ')
      ? new XElement(w + 't', new XAttribute(xmlNs + 'space', 'preserve'), text)
      : new XElement(w + 't', text);
    return new XElement(w + 'r',
      rPr ? new XElement(rPr) : undefined,
      tElement
    );
  });

  const pPr = para.element(w + 'pPr');
  return new XElement(w + 'p',
    new XAttribute(XNamespace.xmlns + 'w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'),
    pPr ? new XElement(pPr) : undefined,
    ...coalescedRuns
  );
}

function atomizeRunsInParagraph(para: XElement): XElement {
  const pPr = para.element(w + 'pPr');

  const newRuns: XElement[] = [];
  for (const run of para.elements(w + 'r')) {
    const rPr = run.element(w + 'rPr');
    const text = run.element(w + 't')?.value ?? '';
    for (const ch of [...text]) {
      const tElement = ch === ' '
        ? new XElement(w + 't', new XAttribute(xmlNs + 'space', 'preserve'), ch)
        : new XElement(w + 't', ch);
      const newRun = new XElement(w + 'r',
        rPr ? new XElement(rPr) : undefined,
        tElement
      );
      newRuns.push(newRun);
    }
  }

  return new XElement(w + 'p',
    new XAttribute(XNamespace.xmlns + 'w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'),
    pPr ? new XElement(pPr) : undefined,
    ...newRuns
  );
}

describe('Open XML paragraph transformation', () => {
  it('splits a paragraph with two runs into character-level runs preserving run properties', () => {
    const para = XElement.parse(inputXml);
    const newPara = atomizeRunsInParagraph(para);

    expect(newPara.toStringWithIndentation()).toBe(characterLevelExpected);
  });

  it('splits into character runs then coalesces back with groupAdjacent', () => {
    const para = XElement.parse(inputXml);
    const charPara = atomizeRunsInParagraph(para);

    // Verify character-level split
    expect(charPara.toStringWithIndentation()).toBe(characterLevelExpected);

    // Coalesce and verify round-trip
    const coalescedPara = coalesceRunsInParagraph(charPara);

    expect(coalescedPara.toStringWithIndentation()).toBe(
      XElement.parse(inputXml).toStringWithIndentation()
    );
  });
});
