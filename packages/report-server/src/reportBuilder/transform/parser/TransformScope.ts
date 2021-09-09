/*
 * This is a more fully featured example, with all methods
 * used in mathjs.
 *
 */

export class TransformScope {
  private readonly scope: Map<string, unknown>;

  public constructor() {
    this.scope = new Map<string, unknown>();
  }

  public get(key: string) {
    return this.scope.get(key);
  }

  public set(key: string, value: unknown) {
    return this.scope.set(key, value);
  }

  public has(key: string) {
    if (key.startsWith('$')) {
      // This method is checked to see if a symbol exists in the scope
      // Since we want variable symbols (ones that start with '$') to have a value of 'undefined'
      // when not in the scope, we lie here and always return true for variables. If not an error would be thrown
      return true;
    }

    return this.scope.has(key);
  }

  public keys() {
    return Array.from(new Set(...this.scope.keys()));
  }

  public delete(key: string) {
    this.scope.delete(key);
  }

  public clear() {
    this.scope.clear();
  }
}
