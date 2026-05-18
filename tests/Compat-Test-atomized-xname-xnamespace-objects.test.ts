/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from the "Atomized XName and XNamespace objects" article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/atomized-xname-xnamespace-objects

import { describe, it } from 'vitest';
import { XElement, XName } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Atomized XName and XNamespace objects (conceptual)', () => {
  // COMPAT: the C# example uses an implicit `XName n = "Root"` conversion. TS
  // explicit form: `XName.get('Root')`. The interning/atomization semantics are
  // the same; equality is by reference identity.
  it('identical XNames refer to the same instance (reference identity)', () => {
    const con = createConsole();

    // ---- C# original ----
    // var r1 = new XElement("Root", "data1");
    // XElement r2 = XElement.Parse("<Root>data2</Root>");
    // if ((object)r1.Name == (object)r2.Name)
    //     Console.WriteLine("r1 and r2 have names that refer to the same instance.");
    // else Console.WriteLine("Different");
    // XName n = "Root";
    // if ((object)n == (object)r1.Name)
    //     Console.WriteLine("The name of r1 and the name in 'n' refer to the same instance.");
    // else Console.WriteLine("Different");
    // ---------------------

    const r1 = new XElement('Root', 'data1');
    const r2 = XElement.parse('<Root>data2</Root>');
    if ((r1.name as object) === (r2.name as object)) {
      con.writeLine('r1 and r2 have names that refer to the same instance.');
    } else {
      con.writeLine('Different');
    }

    const n = XName.get('Root');
    if ((n as object) === (r1.name as object)) {
      con.writeLine("The name of r1 and the name in 'n' refer to the same instance.");
    } else {
      con.writeLine('Different');
    }

    expectMatches(
      con.text(),
      `r1 and r2 have names that refer to the same instance.
The name of r1 and the name in 'n' refer to the same instance.`,
    );
  });

  // COMPAT: substituted — `(int)e == 1` → `Number(e.value) === 1`.
  it('Descendants(XName) leverages atomization for fast filtering', () => {
    const con = createConsole();

    // ---- C# original ----
    // var root = new XElement("Root",
    //     new XElement("C1", 1),
    //     new XElement("Z1", new XElement("C1", 2), new XElement("C1", 1)));
    // var query = from e in root.Descendants("C1") where (int)e == 1 select e;
    // foreach (var z in query) Console.WriteLine(z);
    // ---------------------

    const root = new XElement(
      'Root',
      new XElement('C1', 1),
      new XElement('Z1', new XElement('C1', 2), new XElement('C1', 1)),
    );
    const query = root.descendants('C1').filter((e) => Number(e.value) === 1);
    for (const z of query) {
      con.writeLine(z);
    }

    expectMatches(
      con.text(),
      `<C1>1</C1>
<C1>1</C1>`,
    );
  });
});
