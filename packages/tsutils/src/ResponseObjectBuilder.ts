export type Writable<T> = { -readonly [field in keyof T]?: T[field] };

export class ResponseObjectBuilder<T> {
  private readonly responseObject: Writable<T> = {};

  public set<K extends keyof T>(field: K, value: T[K]) {
    this.responseObject[field] = value;
  }

  public build() {
    return this.responseObject as T;
  }
}
