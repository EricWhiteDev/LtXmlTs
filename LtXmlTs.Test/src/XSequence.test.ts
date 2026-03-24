/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

import { describe, it, expect } from 'vitest';
import {
  XElement, XAttribute, XText, XComment, XName,
  XSequence, xseq,
  ancestors, ancestorsAndSelf, attributes, descendants, descendantsAndSelf,
  descendantNodes, elements, nodes, inDocumentOrder, remove,
} from 'ltxmlts';

// Helper to build a small tree:
// <root>
//   <a id='1'><b/><c/></a>
//   <a id='2'><d/></a>
// </root>
function makeTree() {
  const b = new XElement('b');
  const c = new XElement('c');
  const d = new XElement('d');
  const a1 = new XElement('a', new XAttribute('id', '1'), b, c);
  const a2 = new XElement('a', new XAttribute('id', '2'), d);
  const root = new XElement('root', a1, a2);
  return { root, a1, a2, b, c, d };
}

// ---------------------------------------------------------------------------
describe('xseq() factory', () => {
  it('wraps an array and toArray returns a copy', () => {
    const { a1, a2 } = makeTree();
    const seq = xseq([a1, a2]);
    const arr = seq.toArray();
    expect(arr).toEqual([a1, a2]);
  });

  it('is iterable via for-of', () => {
    const { a1, a2 } = makeTree();
    const collected: XElement[] = [];
    for (const el of xseq([a1, a2])) collected.push(el);
    expect(collected).toEqual([a1, a2]);
  });

  it('wraps an empty array', () => {
    expect(xseq([]).toArray()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.ancestors', () => {
  it('returns empty sequence for empty input', () => {
    expect(xseq([]).ancestors().toArray()).toEqual([]);
  });

  it('returns ancestors of a single node in order (nearest first)', () => {
    const { b, a1, root } = makeTree();
    const result = xseq([b]).ancestors().toArray();
    expect(result).toEqual([a1, root]);
  });

  it('flattens ancestors across multiple nodes', () => {
    const { b, c, a1, root } = makeTree();
    const result = xseq([b, c]).ancestors().toArray();
    expect(result).toEqual([a1, root, a1, root]);
  });

  it('filters by name', () => {
    const { b, a1, root } = makeTree();
    const result = xseq([b]).ancestors('a').toArray();
    expect(result).toEqual([a1]);
  });

  it('returns empty when name does not match', () => {
    const { b } = makeTree();
    expect(xseq([b]).ancestors('z').toArray()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.ancestorsAndSelf', () => {
  it('includes self as first element', () => {
    const { b, a1, root } = makeTree();
    const result = xseq([b]).ancestorsAndSelf().toArray();
    expect(result).toEqual([b, a1, root]);
  });

  it('flattens across multiple elements', () => {
    const { b, c, a1, root } = makeTree();
    const result = xseq([b, c]).ancestorsAndSelf().toArray();
    expect(result).toEqual([b, a1, root, c, a1, root]);
  });

  it('filters by name', () => {
    const { b, a1 } = makeTree();
    const result = xseq([b]).ancestorsAndSelf('a').toArray();
    expect(result).toEqual([a1]);
  });

  it('non-XElement items are skipped', () => {
    const { b } = makeTree();
    const text = new XText('hello');
    // XText is XNode but not XElement — ancestorsAndSelf skips it
    expect(xseq([text] as any).ancestorsAndSelf().toArray()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.descendants', () => {
  it('returns empty for leaf elements', () => {
    const { b } = makeTree();
    expect(xseq([b]).descendants().toArray()).toEqual([]);
  });

  it('returns all descendants of a single element', () => {
    const { a1, b, c } = makeTree();
    expect(xseq([a1]).descendants().toArray()).toEqual([b, c]);
  });

  it('flattens descendants across multiple elements', () => {
    const { a1, a2, b, c, d } = makeTree();
    const result = xseq([a1, a2]).descendants().toArray();
    expect(result).toEqual([b, c, d]);
  });

  it('filters by name', () => {
    const { root, b } = makeTree();
    const result = xseq([root]).descendants('b').toArray();
    expect(result).toEqual([b]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.descendantsAndSelf', () => {
  it('includes self', () => {
    const { b } = makeTree();
    expect(xseq([b]).descendantsAndSelf().toArray()).toEqual([b]);
  });

  it('includes self and all descendants', () => {
    const { a1, b, c } = makeTree();
    expect(xseq([a1]).descendantsAndSelf().toArray()).toEqual([a1, b, c]);
  });

  it('flattens across multiple elements', () => {
    const { a1, a2, b, c, d } = makeTree();
    const result = xseq([a1, a2]).descendantsAndSelf().toArray();
    expect(result).toEqual([a1, b, c, a2, d]);
  });

  it('filters by name', () => {
    const { root, a1, a2 } = makeTree();
    const result = xseq([root]).descendantsAndSelf('a').toArray();
    expect(result).toEqual([a1, a2]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.descendantNodes', () => {
  it('includes text and comment nodes', () => {
    const comment = new XComment('note');
    const text = new XText('hello');
    const child = new XElement('child');
    const parent = new XElement('parent', comment, text, child);
    const result = xseq([parent]).descendantNodes().toArray();
    expect(result).toContain(comment);
    expect(result).toContain(text);
    expect(result).toContain(child);
    expect(result.length).toBe(3);
  });

  it('flattens across multiple elements', () => {
    const { a1, a2, b, c, d } = makeTree();
    const result = xseq([a1, a2]).descendantNodes().toArray();
    expect(result).toEqual([b, c, d]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.elements', () => {
  it('returns only element children', () => {
    const text = new XText('hello');
    const child = new XElement('child');
    const parent = new XElement('parent', text, child);
    expect(xseq([parent]).elements().toArray()).toEqual([child]);
  });

  it('flattens children across multiple elements', () => {
    const { a1, a2, b, c, d } = makeTree();
    const result = xseq([a1, a2]).elements().toArray();
    expect(result).toEqual([b, c, d]);
  });

  it('filters by name', () => {
    const { root, a1, a2 } = makeTree();
    const result = xseq([root]).elements('a').toArray();
    expect(result).toEqual([a1, a2]);
  });

  it('returns empty for leaf elements', () => {
    const { b } = makeTree();
    expect(xseq([b]).elements().toArray()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.nodes', () => {
  it('returns all child nodes including non-elements', () => {
    const text = new XText('hi');
    const comment = new XComment('c');
    const el = new XElement('child');
    const parent = new XElement('parent', text, comment, el);
    const result = xseq([parent]).nodes().toArray();
    expect(result).toEqual([text, comment, el]);
  });

  it('flattens across multiple parents', () => {
    const { a1, a2, b, c, d } = makeTree();
    const result = xseq([a1, a2]).nodes().toArray();
    expect(result).toEqual([b, c, d]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.attributes', () => {
  it('returns all attributes across multiple elements', () => {
    const { a1, a2 } = makeTree();
    const result = xseq([a1, a2]).attributes().toArray();
    expect(result.length).toBe(2);
    expect(result[0].value).toBe('1');
    expect(result[1].value).toBe('2');
  });

  it('filters by name', () => {
    const el = new XElement('el',
      new XAttribute('x', '1'),
      new XAttribute('y', '2'),
    );
    const result = xseq([el]).attributes('x').toArray();
    expect(result.length).toBe(1);
    expect(result[0].value).toBe('1');
  });

  it('skips non-XElement items', () => {
    const text = new XText('hi');
    expect(xseq([text] as any).attributes().toArray()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.inDocumentOrder', () => {
  it('returns empty sequence unchanged', () => {
    expect(xseq([]).inDocumentOrder().toArray()).toEqual([]);
  });

  it('sorts nodes that are already in order', () => {
    const { root, a1, b } = makeTree();
    const result = xseq([root, a1, b]).inDocumentOrder().toArray();
    expect(result).toEqual([root, a1, b]);
  });

  it('sorts nodes that are out of order', () => {
    const { root, a1, b } = makeTree();
    const result = xseq([b, root, a1]).inDocumentOrder().toArray();
    expect(result).toEqual([root, a1, b]);
  });

  it('sorts attributes after their parent element', () => {
    const attr = new XAttribute('id', '1');
    const el = new XElement('el', attr);
    const result = xseq([attr, el] as any).inDocumentOrder().toArray();
    expect(result).toEqual([el, attr]);
  });
});

// ---------------------------------------------------------------------------
describe('XSequence.remove — nodes', () => {
  it('removes all nodes from their parents', () => {
    const { root, a1, a2 } = makeTree();
    xseq([a1, a2]).remove();
    expect(root.elements()).toEqual([]);
  });

  it('is safe to remove all children while iterating', () => {
    const { root } = makeTree();
    const kids = root.elements();
    expect(() => xseq(kids).remove()).not.toThrow();
    expect(root.elements()).toEqual([]);
  });
});

describe('XSequence.remove — attributes', () => {
  it('removes all attributes from their parent elements', () => {
    const { a1, a2 } = makeTree();
    const attrs = xseq([a1, a2]).attributes().toArray();
    xseq(attrs).remove();
    expect(a1.attributes()).toEqual([]);
    expect(a2.attributes()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe('Standalone functions', () => {
  it('ancestors() matches XSequence result', () => {
    const { b, a1, root } = makeTree();
    expect(ancestors([b])).toEqual(xseq([b]).ancestors().toArray());
  });

  it('ancestorsAndSelf() matches XSequence result', () => {
    const { b } = makeTree();
    expect(ancestorsAndSelf([b])).toEqual(xseq([b]).ancestorsAndSelf().toArray());
  });

  it('attributes() matches XSequence result', () => {
    const { a1, a2 } = makeTree();
    expect(attributes([a1, a2])).toEqual(xseq([a1, a2]).attributes().toArray());
  });

  it('descendants() matches XSequence result', () => {
    const { root } = makeTree();
    expect(descendants([root])).toEqual(xseq([root]).descendants().toArray());
  });

  it('descendantsAndSelf() matches XSequence result', () => {
    const { root } = makeTree();
    expect(descendantsAndSelf([root])).toEqual(xseq([root]).descendantsAndSelf().toArray());
  });

  it('descendantNodes() matches XSequence result', () => {
    const { root } = makeTree();
    expect(descendantNodes([root])).toEqual(xseq([root]).descendantNodes().toArray());
  });

  it('elements() matches XSequence result', () => {
    const { root } = makeTree();
    expect(elements([root])).toEqual(xseq([root]).elements().toArray());
  });

  it('nodes() matches XSequence result', () => {
    const { root } = makeTree();
    expect(nodes([root])).toEqual(xseq([root]).nodes().toArray());
  });

  it('inDocumentOrder() matches XSequence result', () => {
    const { b, root, a1 } = makeTree();
    expect(inDocumentOrder([b, root, a1])).toEqual(xseq([b, root, a1]).inDocumentOrder().toArray());
  });

  it('remove() removes nodes from their parents', () => {
    const { root, a1, a2 } = makeTree();
    remove([a1, a2]);
    expect(root.elements()).toEqual([]);
  });
});
