/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from "How to change the namespace for an entire XML tree".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/change-namespace-entire-xml-tree

import { describe, it } from 'vitest';

describe('Change the namespace for an entire XML tree (conceptual)', () => {
  // COMPAT: skipped — the .NET example sets `XElement.Name` to rebrand each
  // element into the new namespace (`el.Name = aw.GetName(el.Name.LocalName)`).
  // The LtXmlTs port has no XElement.Name setter (Table 2). The equivalent
  // "remove and re-add with new name" pattern would rewrite the example
  // substantially, so this is left as a skip rather than a substituted port.
  it.skip('Set XElement.Name on every descendant to change the namespace of the entire tree', () => {});
});
