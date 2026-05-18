/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "Performance of chained queries".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/performance-chained-queries

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Performance of chained queries (conceptual)', () => {
  // COMPAT: substituted — `(int)x` → `Number(x.value)`.
  it('chained queries (query2 feeds from query1) compose lazily', () => {
    const con = createConsole();

    const root = new XElement(
      'Root',
      new XElement('Child', 1),
      new XElement('Child', 2),
      new XElement('Child', 3),
      new XElement('Child', 4),
    );

    const query1 = root.elements('Child').filter((x) => Number(x.value) >= 3);
    const query2 = query1.filter((e) => Number(e.value) % 2 === 0);

    for (const i of query2) {
      con.writeLine(Number(i.value));
    }

    expectMatches(con.text(), `4`);
  });
});
