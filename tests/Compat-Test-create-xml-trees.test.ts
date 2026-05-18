/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the seven C# examples from the "Create XML Trees in C#" conceptual article.
// Source: https://learn.microsoft.com/en-us/dotnet/standard/linq/create-xml-trees

import { describe, it } from 'vitest';
import { XAttribute, XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('Create XML Trees (conceptual)', () => {
  it('XElement with simple string content', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement n = new XElement("Customer", "Adventure Works");
    // Console.WriteLine(n);
    // ---------------------

    const n = new XElement('Customer', 'Adventure Works');
    con.writeLine(n);

    expectMatches(con.text(), `<Customer>Adventure Works</Customer>`);
  });

  it('XElement with a floating-point number as content (stringified)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement n = new XElement("Cost", 324.50);
    // Console.WriteLine(n);
    // ---------------------

    const n = new XElement('Cost', 324.5);
    con.writeLine(n);

    expectMatches(con.text(), `<Cost>324.5</Cost>`);
  });

  it('XElement with a single child element', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement shippingUnit = new XElement("ShippingUnit",
    //     new XElement("Cost", 324.50));
    // Console.WriteLine(shippingUnit);
    // ---------------------

    const shippingUnit = new XElement('ShippingUnit', new XElement('Cost', 324.5));
    con.writeLine(shippingUnit);

    expectMatches(
      con.text(),
      `<ShippingUnit>
  <Cost>324.5</Cost>
</ShippingUnit>`,
    );
  });

  it('XElement with multiple child elements', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement address = new XElement("Address",
    //     new XElement("Street1", "123 Main St"),
    //     new XElement("City", "Mercer Island"),
    //     new XElement("State", "WA"),
    //     new XElement("Postal", "68042"));
    // Console.WriteLine(address);
    // ---------------------

    const address = new XElement(
      'Address',
      new XElement('Street1', '123 Main St'),
      new XElement('City', 'Mercer Island'),
      new XElement('State', 'WA'),
      new XElement('Postal', '68042'),
    );
    con.writeLine(address);

    expectMatches(
      con.text(),
      `<Address>
  <Street1>123 Main St</Street1>
  <City>Mercer Island</City>
  <State>WA</State>
  <Postal>68042</Postal>
</Address>`,
    );
  });

  it('Full contacts tree (nested structure)', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement contacts =
    //     new XElement("Contacts",
    //         new XElement("Contact",
    //             new XElement("Name", "Patrick Hines"),
    //             new XElement("Phone", "206-555-0144"),
    //             new XElement("Address",
    //                 new XElement("Street1", "123 Main St"),
    //                 new XElement("City", "Mercer Island"),
    //                 new XElement("State", "WA"),
    //                 new XElement("Postal", "68042"))));
    // Console.WriteLine(contacts);
    // ---------------------

    const contacts = new XElement(
      'Contacts',
      new XElement(
        'Contact',
        new XElement('Name', 'Patrick Hines'),
        new XElement('Phone', '206-555-0144'),
        new XElement(
          'Address',
          new XElement('Street1', '123 Main St'),
          new XElement('City', 'Mercer Island'),
          new XElement('State', 'WA'),
          new XElement('Postal', '68042'),
        ),
      ),
    );
    con.writeLine(contacts);

    expectMatches(
      con.text(),
      `<Contacts>
  <Contact>
    <Name>Patrick Hines</Name>
    <Phone>206-555-0144</Phone>
    <Address>
      <Street1>123 Main St</Street1>
      <City>Mercer Island</City>
      <State>WA</State>
      <Postal>68042</Postal>
    </Address>
  </Contact>
</Contacts>`,
    );
  });

  it('XElement with an XAttribute and text content', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement phone = new XElement("Phone",
    //     new XAttribute("Type", "Home"),
    //     "555-555-5555");
    // Console.WriteLine(phone);
    // ---------------------

    const phone = new XElement('Phone', new XAttribute('Type', 'Home'), '555-555-5555');
    con.writeLine(phone);

    expectMatches(con.text(), `<Phone Type="Home">555-555-5555</Phone>`);
  });

  it('Empty XElement', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement n = new XElement("Customer");
    // Console.WriteLine(n);
    // ---------------------

    const n = new XElement('Customer');
    con.writeLine(n);

    expectMatches(con.text(), `<Customer />`);
  });

  it('Attach vs. clone: a parented node is cloned, an unparented node is attached', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement xmlTree1 = new XElement("Root", new XElement("Child1", 1));
    // XElement child2 = new XElement("Child2", 2);
    // XElement xmlTree2 = new XElement("Root", xmlTree1.Element("Child1"), child2);
    // Console.WriteLine("Child1 was {0}",
    //     xmlTree1.Element("Child1") == xmlTree2.Element("Child1") ? "attached" : "cloned");
    // Console.WriteLine("Child2 was {0}",
    //     child2 == xmlTree2.Element("Child2") ? "attached" : "cloned");
    // ---------------------

    const xmlTree1 = new XElement('Root', new XElement('Child1', 1));
    const child2 = new XElement('Child2', 2);
    const xmlTree2 = new XElement('Root', xmlTree1.element('Child1'), child2);

    con.writeLine(
      `Child1 was ${xmlTree1.element('Child1') === xmlTree2.element('Child1') ? 'attached' : 'cloned'}`,
    );
    con.writeLine(
      `Child2 was ${child2 === xmlTree2.element('Child2') ? 'attached' : 'cloned'}`,
    );

    expectMatches(
      con.text(),
      `Child1 was cloned
Child2 was attached`,
    );
  });
});
