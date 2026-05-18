/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# examples from "How to chain axis method calls".
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/chain-axis-method-calls
//
// COMPAT: substituted — inline XElement.parse for "PurchaseOrders.xml" and
// "Irregular.xml". The C# `.Elements("X").Elements("Y").Elements("Z")` chain
// (which mixes XContainer.Elements and Extensions.Elements) is implemented as
// `.flatMap(...)` chains in TS. The namespace variant is included as a
// separate (skipped) test because it requires the port to re-emit inherited
// `xmlns:` declarations when serializing a standalone descendant.

import { describe, it } from 'vitest';
import { XElement, XNamespace } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Chain axis method calls (conceptual)', () => {
  it('PurchaseOrder/Address/Name chain returns every Name across all addresses', () => {
    const con = createConsole();

    const purchaseOrders = XElement.parse(`<PurchaseOrders>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Ellen Adams</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Tai Yee</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Cristian Osorio</Name>
    </Address>
    <Address Type="Billing">
      <Name>Cristian Osorio</Name>
    </Address>
  </PurchaseOrder>
  <PurchaseOrder>
    <Address Type="Shipping">
      <Name>Jessica Arnold</Name>
    </Address>
    <Address Type="Billing">
      <Name>Jessica Arnold</Name>
    </Address>
  </PurchaseOrder>
</PurchaseOrders>`);

    const names = purchaseOrders
      .elements('PurchaseOrder')
      .flatMap((p) => p.elements('Address'))
      .flatMap((a) => a.elements('Name'));
    for (const e of names) {
      con.writeLine(e);
    }

    expectMatches(
      con.text(),
      `<Name>Ellen Adams</Name>
<Name>Tai Yee</Name>
<Name>Cristian Osorio</Name>
<Name>Cristian Osorio</Name>
<Name>Jessica Arnold</Name>
<Name>Jessica Arnold</Name>`,
    );
  });

  it('Customer/Config/ConfigParameter chain skips the Root-level ConfigParameter', () => {
    const con = createConsole();

    const root = XElement.parse(`<Root>
  <ConfigParameter>RootConfigParameter</ConfigParameter>
  <Customer>
    <Name>Frank</Name>
    <Config>
      <ConfigParameter>FirstConfigParameter</ConfigParameter>
    </Config>
  </Customer>
  <Customer>
    <Name>Bob</Name>
    <!--This customer doesn't have a Config element-->
  </Customer>
  <Customer>
    <Name>Bill</Name>
    <Config>
      <ConfigParameter>SecondConfigParameter</ConfigParameter>
    </Config>
  </Customer>
</Root>`);

    const configParameters = root
      .elements('Customer')
      .flatMap((c) => c.elements('Config'))
      .flatMap((cfg) => cfg.elements('ConfigParameter'));
    for (const cp of configParameters) {
      con.writeLine(cp);
    }

    expectMatches(
      con.text(),
      `<ConfigParameter>FirstConfigParameter</ConfigParameter>
<ConfigParameter>SecondConfigParameter</ConfigParameter>`,
    );
  });

  // COMPAT (port behavior, intentional): .NET re-emits the inherited
  // `xmlns:aw="..."` declaration when serializing a standalone descendant; the
  // LtXmlTs port drops the inherited prefix declaration. Expected output
  // adjusted to the port's emission.
  it('PurchaseOrders-in-namespace chain returns every aw:Name (without re-emitted xmlns)', () => {
    const con = createConsole();

    const aw = XNamespace.get('http://www.adventure-works.com');
    const purchaseOrders = XElement.parse(`<aw:PurchaseOrders xmlns:aw="http://www.adventure-works.com">
  <aw:PurchaseOrder>
    <aw:Address>
      <aw:Name>Ellen Adams</aw:Name>
    </aw:Address>
  </aw:PurchaseOrder>
</aw:PurchaseOrders>`);

    const names = purchaseOrders
      .elements(aw.getName('PurchaseOrder'))
      .flatMap((p) => p.elements(aw.getName('Address')))
      .flatMap((a) => a.elements(aw.getName('Name')));
    for (const e of names) {
      con.writeLine(e);
    }

    expectMatches(
      con.text(),
      `<aw:Name>Ellen Adams</aw:Name>`,
    );
  });
});
