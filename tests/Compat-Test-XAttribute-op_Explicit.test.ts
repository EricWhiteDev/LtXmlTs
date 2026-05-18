/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports a representative subset of the 25 C# explicit-cast operator examples
// from XAttribute.Explicit operator reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.op_explicit?view=netframework-4.8.1
//
// COMPAT: TypeScript has no operator overloading; the C# explicit-cast forms
// `(string)att`, `(int)att`, `(int?)att`, `(bool)att`, etc. are substituted
// with JS coercion idioms — `att.value`, `Number(att.value)`,
// `att ? Number(att.value) : null`, `att.value === "true"`. Per plan Table 2
// + Decisions (3), these tests verify the *value-coercion semantics* the docs
// illustrate; the operator-overload surface itself is intentionally out of scope.
//
// Locale-dependent overloads (DateTime, DateTimeOffset, TimeSpan) and Guid are
// omitted: their .NET output uses host-culture / GUID formatting that wouldn't
// match a deterministic JS substitution.

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute explicit-cast operators (compat-by-substitution)', () => {
  it('(string)att — string content round-trips through Value', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att", "attribute content")
    // );
    // XAttribute att = root.Attribute("Att");
    // string str = (string)att;
    // Console.WriteLine("(string)att={0}", str);
    // ---------------------

    const root = new XElement('Root', new XAttribute('Att', 'attribute content'));
    const att = root.attribute('Att')!;
    const str = att.value;
    con.writeLine(`(string)att=${str}`);

    expectMatches(con.text(), `(string)att=attribute content`);
  });

  it('(int)att — Int32 max value parses correctly', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att", 2147483647)
    // );
    // int value = (int)root.Attribute("Att");
    // Console.WriteLine("value={0}", value);
    // ---------------------

    const root = new XElement('Root', new XAttribute('Att', 2147483647));
    const value = Number(root.attribute('Att')!.value);
    con.writeLine(`value=${value}`);

    expectMatches(con.text(), `value=2147483647`);
  });

  it('(int?)att — nullable-int cast returns the parsed value when present', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("Att", 2147483647)
    // );
    // int? value = (int?)root.Attribute("Att");
    // Console.WriteLine("Nullable int: value={0}", value == null ? "null" : value.ToString());
    // ---------------------

    const root = new XElement('Root', new XAttribute('Att', 2147483647));
    const att = root.attribute('Att');
    const value: number | null = att ? Number(att.value) : null;
    con.writeLine(`Nullable int: value=${value === null ? 'null' : value.toString()}`);

    expectMatches(con.text(), `Nullable int: value=2147483647`);
  });

  it('(bool)att — Boolean value coerces correctly', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root = new XElement("Root",
    //     new XAttribute("BoolValue", true)
    // );
    // bool bv = (bool)root.Attribute("BoolValue");
    // Console.WriteLine("(bool)BoolValue={0}", bv);
    // ---------------------

    // Note: C# `true.ToString()` yields "True" (capitalized); the XAttribute
    // stores the value as the string "true" (lowercase) per XML conventions,
    // and Boolean.ToString() on the cast result prints "True". We mirror by
    // using formatLikeDotNet(true) -> "True".
    const root = new XElement('Root', new XAttribute('BoolValue', true));
    const att = root.attribute('BoolValue')!;
    // .NET cast accepts "true"/"false" (and "0"/"1") case-insensitively.
    const bv = att.value.toLowerCase() === 'true' || att.value === '1';
    con.writeLine(`(bool)BoolValue=${bv ? 'True' : 'False'}`);

    expectMatches(con.text(), `(bool)BoolValue=True`);
  });
});
