/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

// Ports the C# example from XAttribute(XAttribute) constructor reference page.
// Source: https://learn.microsoft.com/en-us/dotnet/api/system.xml.linq.xattribute.-ctor?view=netframework-4.8.1

import { describe, it } from 'vitest';
import { XElement } from 'ltxmlts';
import { createConsole, expectMatches } from './Compat-Test-_helpers.js';

describe('XAttribute(XAttribute) copy constructor', () => {
  it('deep-copying an element creates a new attribute instance, not a reference', () => {
    const con = createConsole();

    // ---- C# original ----
    // XElement root1 = XElement.Parse("<Root Att1='abc' />");
    // // Make a deep copy.
    // XElement root2 = new XElement(root1);
    // if (root1.Attribute("Att1") == root2.Attribute("Att1"))
    //     Console.WriteLine("This will not be printed");
    // else
    //     Console.WriteLine("Creating a deep copy created a new attribute from the original.");
    // ---------------------

    const root1 = XElement.parse("<Root Att1='abc' />");
    const root2 = new XElement(root1);
    if (root1.attribute('Att1') === root2.attribute('Att1')) {
      con.writeLine('This will not be printed');
    } else {
      con.writeLine('Creating a deep copy created a new attribute from the original.');
    }

    expectMatches(
      con.text(),
      'Creating a deep copy created a new attribute from the original.',
    );
  });
});
