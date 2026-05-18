/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to find the root element".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/find-root-element
//
// COMPAT: substituted — inline XDocument.parse for "PurchaseOrders.xml", and
// the XPath comparison is replaced with a self-compare of XDocument.Root
// (XPath is not in the LtXmlTs port).

import { describe, it } from 'vitest';
import { XDocument } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Find the root element (conceptual)', () => {
  it('XDocument.root returns the document root element', () => {
    const con = createConsole();

    const po = XDocument.parse(`<PurchaseOrders>
  <PurchaseOrder/>
</PurchaseOrders>`);

    const el1 = po.root;
    const el2 = po.root;

    if (el1 === el2) {
      con.writeLine('Results are identical');
    } else {
      con.writeLine('Results differ');
    }
    con.writeLine(el1!.name);

    expectMatches(
      con.text(),
      `Results are identical
PurchaseOrders`,
    );
  });
});
