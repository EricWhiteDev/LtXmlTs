/*
 * LtXmlTs (LINQ to XML for TypeScript)
 * Copyright (c) 2026 Eric White
 * eric@ericwhite.com
 * https://www.ericwhite.com
 * linkedin.com/in/ericwhitedev
 * Licensed under the MIT License
 */

export function xmlEscapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function xmlEscapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&apos;');
}

export function indentXml(xml: string): string {
  const INDENT = '  ';
  const TOKEN_RE =
    /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/[^>]+>|<[^>]+\/>|<[^>]+>|[^<]+/g;

  function isOpenTag(t: string): boolean {
    return t.startsWith('<') && !t.startsWith('</') && !t.startsWith('<?') &&
      !t.startsWith('<!--') && !t.startsWith('<![CDATA[') && !t.endsWith('/>');
  }
  function isCloseTag(t: string): boolean { return t.startsWith('</'); }
  function isDirectText(t: string): boolean {
    if (t.startsWith('<![CDATA[')) return true;
    return !t.startsWith('<') && t.trim().length > 0;
  }

  // Tokenize
  const tokens: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(xml)) !== null) tokens.push(m[0]);

  // For each open tag index, record whether it has non-whitespace text at direct child depth.
  // Elements with direct text (text-only or mixed content) are emitted compactly on one line.
  const hasDirectText = new Set<number>();
  for (let i = 0; i < tokens.length; i++) {
    if (!isOpenTag(tokens[i])) continue;
    let depth = 1;
    for (let j = i + 1; j < tokens.length; j++) {
      if (isOpenTag(tokens[j])) depth++;
      else if (isCloseTag(tokens[j])) { depth--; if (depth === 0) break; }
      else if (isDirectText(tokens[j]) && depth === 1) { hasDirectText.add(i); break; }
    }
  }

  // Emit with indentation, keeping compact any element that has direct text content.
  const lines: string[] = [];
  let level = 0;
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (!token.startsWith('<') && token.trim() === '') { i++; continue; }
    if (isCloseTag(token)) {
      level--;
      lines.push(INDENT.repeat(level) + token);
      i++;
    } else if (token.startsWith('<?') || token.startsWith('<!--') || token.startsWith('<![CDATA[')) {
      lines.push(INDENT.repeat(level) + token);
      i++;
    } else if (token.endsWith('/>')) {
      lines.push(INDENT.repeat(level) + token);
      i++;
    } else if (isOpenTag(token) && hasDirectText.has(i)) {
      let depth = 1;
      let compact = token;
      let j = i + 1;
      while (j < tokens.length && depth > 0) {
        if (isOpenTag(tokens[j])) depth++;
        else if (isCloseTag(tokens[j])) depth--;
        compact += tokens[j];
        j++;
      }
      lines.push(INDENT.repeat(level) + compact);
      i = j;
    } else if (isOpenTag(token)) {
      lines.push(INDENT.repeat(level) + token);
      level++;
      i++;
    } else {
      lines.push(INDENT.repeat(level) + token.trim());
      i++;
    }
  }
  return lines.join('\n');
}
