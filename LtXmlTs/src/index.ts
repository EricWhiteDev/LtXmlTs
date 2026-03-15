export class XObject {
  #annotations: any[] = [];

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
}
