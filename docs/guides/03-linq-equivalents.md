---
title: LINQ to JS/TS Equivalents
group: Guides
category: Guides
---

# LINQ to JS/TS Equivalents

This reference maps .NET LINQ methods to their closest JavaScript / TypeScript
equivalents. Use it when translating C# LINQ-to-XML code to LtXmlTs.

## Direct Array Method Equivalents

| LINQ | JavaScript / TypeScript |
|---|---|
| `Where(x => ...)` | `filter(x => ...)` |
| `Select(x => ...)` | `map(x => ...)` |
| `SelectMany(x => ...)` | `flatMap(x => ...)` |
| `Any(x => ...)` | `some(x => ...)` |
| `All(x => ...)` | `every(x => ...)` |
| `First(x => ...)` | `find(x => ...)` <sup>1</sup> |
| `Last(x => ...)` | `findLast(x => ...)` <sup>2</sup> |
| `Contains(x)` | `includes(x)` |
| `Aggregate(seed, fn)` | `reduce(fn, seed)` |
| `Reverse()` | `[...arr].reverse()` <sup>3</sup> |
| `Concat(other)` | `[...a, ...b]` or `a.concat(b)` |
| `Count()` | `.length` |
| `ElementAt(i)` | `arr[i]` |

## Composed Equivalents

| LINQ | JavaScript / TypeScript |
|---|---|
| `FirstOrDefault()` | `find(...) ?? null` |
| `Distinct()` | `[...new Set(arr)]` |
| `DistinctBy(x => x.key)` | `arr.filter((x, i, a) => a.findIndex(y => y.key === x.key) === i)` |
| `Skip(n)` | `slice(n)` |
| `Take(n)` | `slice(0, n)` |
| `Sum(x => x.val)` | `reduce((acc, x) => acc + x.val, 0)` |
| `Min()` / `Max()` | `Math.min(...arr)` or `reduce(...)` |
| `OrderBy(x => x.key)` | `[...arr].sort((a, b) => a.key - b.key)` <sup>3</sup> |
| `OrderByDescending(...)` | `[...arr].sort((a, b) => b.key - a.key)` <sup>3</sup> |
| `ToDictionary(x => x.key)` | `Object.fromEntries(arr.map(x => [x.key, x]))` |
| `ToLookup(x => x.key)` | `Map` built with `reduce` |
| `GroupBy(x => x.key)` | `Map` built with `reduce` |
| `Except(other)` | `filter(x => !other.includes(x))` |
| `Intersect(other)` | `filter(x => other.includes(x))` |
| `Union(other)` | `[...new Set([...a, ...b])]` |
| `Zip(other, fn)` | `a.map((x, i) => fn(x, other[i]))` |

## No Built-in Equivalent

| LINQ | JavaScript / TypeScript |
|---|---|
| `Single()` | custom -- `find` + assert exactly one match |
| `SkipWhile(pred)` | custom `reduce` or `for`-loop |
| `TakeWhile(pred)` | custom `reduce` or `for`-loop |
| `Chunk(n)` | custom `reduce` grouping into sub-arrays |
| `Join` (inner join) | nested `flatMap` + `filter` |
| `GroupJoin` | `map` + `filter` |
| `Enumerable.Range(start, n)` | `Array.from({length: n}, (_, i) => start + i)` |
| `Enumerable.Repeat(val, n)` | `Array(n).fill(val)` |
| `Enumerable.Empty<T>()` | `[] as T[]` |

---

**Notes**

<sup>1</sup> `find` returns `undefined` (not an exception) when nothing matches -- it behaves like `FirstOrDefault`, not `First`.

<sup>2</sup> `findLast` is ES2023; use `[...arr].reverse().find(...)` for older targets.

<sup>3</sup> `sort` and `reverse` mutate in place -- spread first (`[...arr]`) if you need the original array preserved.
