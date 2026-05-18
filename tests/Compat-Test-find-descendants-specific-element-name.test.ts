/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the first C# example from "How to find descendants with a specific element name".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-descendants-specific-element-name

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find descendants with a specific element name (conceptual)', () => {
  it('Descendants("t") collects all `t` descendants regardless of depth', () => {
    const con = createConsole();

    const root = XElement.parse(`<root>
  <para>
    <r>
      <t>Some text </t>
    </r>
    <n>
      <r>
        <t>that's broken up into </t>
      </r>
    </n>
    <n>
      <r>
        <t>multiple segments.</t>
      </r>
    </n>
  </para>
</root>`);

    const textSegs = root.descendants('t').map((seg) => seg.value);
    const str = textSegs.join('');
    con.writeLine(str);

    expectMatches(con.text(), `Some text that's broken up into multiple segments.`);
  });
});
