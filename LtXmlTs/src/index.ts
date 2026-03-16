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
  #annotations: any[] = [];
  public nodeType: XmlNodeType = null;
  public parent: XObject | null = null;

  addAnnotation(obj: any): void {
    this.#annotations.push(obj);
  }

  annotation<T>(ctor: new (...args: any[]) => T): T | null {
    for (const item of this.#annotations) {
      if (item instanceof ctor) return item as T;
    }
    return null;
  }

  annotations<T>(ctor: new (...args: any[]) => T): T[] {
    return this.#annotations.filter(item => item instanceof ctor) as T[];
  }

  removeAnnotations(): void;
  removeAnnotations<T>(ctor: new (...args: any[]) => T): void;
  removeAnnotations<T>(ctor?: new (...args: any[]) => T): void {
    if (ctor === undefined) {
      this.#annotations = [];
    } else {
      this.#annotations = this.#annotations.filter(item => item.constructor !== ctor);
    }
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
