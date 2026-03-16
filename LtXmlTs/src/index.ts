export type XmlNodeType =
  | 'Element'
  | 'Text'
  | 'Comment'
  | 'CDATA'
  | 'ProcessingInstruction'
  | 'Entity'
  | 'Attribute'
  | 'Document'
  | null;

export class XObject {
  protected annotationsArray: any[] = [];
  public nodeType: XmlNodeType = null;
  public parent: XObject | null = null;

  addAnnotation(obj: any): void {
    this.annotationsArray.push(obj);
  }

  annotation<T>(ctor: new (...args: any[]) => T): T | null {
    for (const item of this.annotationsArray) {
      if (item instanceof ctor) return item as T;
    }
    return null;
  }

  annotations<T>(ctor: new (...args: any[]) => T): T[] {
    return this.annotationsArray.filter(item => item instanceof ctor) as T[];
  }

  removeAnnotations(): void;
  removeAnnotations<T>(ctor: new (...args: any[]) => T): void;
  removeAnnotations<T>(ctor?: new (...args: any[]) => T): void {
    if (ctor === undefined) {
      this.annotationsArray = [];
    } else {
      this.annotationsArray = this.annotationsArray.filter(item => item.constructor !== ctor);
    }
  }
}

export abstract class XNode extends XObject {}

export abstract class XContainer extends XNode {
  protected nodesArray: XNode[] = [];
}

export class XAttribute extends XObject {
  public readonly name: XName;
  public readonly value: string;

  constructor(name: XName);
  constructor(name: XName, content: unknown);
  constructor(name: XName, content?: unknown) {
    super();
    this.name = name;
    this.value = '';
    if (arguments.length >= 2) {
      if (content === null || content === undefined) {
        throw new Error('XAttribute content cannot be null or undefined');
      } else if (typeof content === 'string') {
        this.value = content;
      } else {
        this.value = (content as { toString(): string }).toString();
      }
    }
  }
}

export class XElement extends XContainer {
  public readonly name: XName;
  private attributesArray: XAttribute[] = [];

  constructor(name: XName);
  constructor(name: XName, ...content: unknown[]);
  constructor(name: XName, ...content: unknown[]) {
    super();
    this.name = name;
    this.nodesArray = [];
  }
}

class XNameCacheEntry {
  name: XName;

  constructor(name: XName) {
    this.name = name;
  }
}

class XNamespaceCacheEntry {
  namespace: XNamespace;
  preferredPrefix: string | null;

  constructor(namespace: XNamespace, preferredPrefix: string | null) {
    this.namespace = namespace;
    this.preferredPrefix = preferredPrefix;
  }
}

export class XNamespace {
  static #namespaceCache: XNamespaceCacheEntry[] = [];

  public static readonly none: XNamespace = new XNamespace('');
  public static readonly xml: XNamespace = new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  public static readonly xmlns: XNamespace = new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');

  public readonly uri: string;

  public get preferredPrefix(): string | null {
    return XNamespace.#namespaceCache.find(e => e.namespace === this)?.preferredPrefix ?? null;
  }

  public get namespaceName(): string {
    return this.uri;
  }

  public static get(uri: string): XNamespace {
    return new XNamespace(uri);
  }

  public static getNone(): XNamespace {
    return new XNamespace('');
  }

  public static getXml(): XNamespace {
    return new XNamespace('http://www.w3.org/XML/1998/namespace', 'xml');
  }

  public static getXmlns(): XNamespace {
    return new XNamespace('http://www.w3.org/2000/xmlns/', 'xmlns');
  }

  public toString(): string {
    return `{${this.uri}}`;
  }

  public getName(localName: string): XName {
    return new XName(this, localName);
  }

  constructor(uri: string, preferredPrefix: string | null = null) {
    this.uri = uri;

    const cached = XNamespace.#namespaceCache.find(e => e.namespace.uri === uri);
    if (cached) {
      if (cached.preferredPrefix !== preferredPrefix) {
        cached.preferredPrefix = preferredPrefix;
      }
      return cached.namespace;
    }

    XNamespace.#namespaceCache.push(new XNamespaceCacheEntry(this, preferredPrefix));
  }
}

export class XName {
  static #nameCache: XNameCacheEntry[] = [];

  public readonly namespace: XNamespace;
  public readonly localName: string;

  public get namespaceName(): string {
    return this.namespace.uri;
  }

  public static get(namespace: XNamespace, localName: string): XName
  public static get(name: string): XName
  public static get(namespaceOrName: XNamespace | string, localName?: string): XName {
    if (namespaceOrName instanceof XNamespace) {
      return new XName(namespaceOrName, localName!);
    }
    return new XName(namespaceOrName);
  }

  constructor(namespace: XNamespace, localName: string)
  constructor(name: string)
  constructor(namespaceOrName: XNamespace | string, localName?: string) {
    let ns: XNamespace;
    let local: string;

    if (namespaceOrName instanceof XNamespace) {
      ns = namespaceOrName;
      local = localName!;
    } else {
      const name = namespaceOrName;
      if (name.startsWith('{')) {
        const closeIdx = name.indexOf('}');
        if (closeIdx === -1) {
          throw new Error(`Invalid clark notation name: '${name}'`);
        }
        ns = new XNamespace(name.slice(1, closeIdx));
        local = name.slice(closeIdx + 1);
      } else {
        ns = XNamespace.none;
        local = name;
      }
    }

    this.namespace = ns;
    this.localName = local;

    const clarkKey = ns.uri === '' ? local : `{${ns.uri}}${local}`;
    const cached = XName.#nameCache.find(e => e.name.toString() === clarkKey);
    if (cached) {
      return cached.name;
    }

    XName.#nameCache.push(new XNameCacheEntry(this));
  }

  public toString(): string {
    return this.namespace.uri === '' ? this.localName : `{${this.namespace.uri}}${this.localName}`;
  }
}
