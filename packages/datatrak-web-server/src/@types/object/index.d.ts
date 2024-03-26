declare global {
  export interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[];
    // @ts-ignore
    entries<U, T>(o: { [key in T]: U } | ArrayLike<U>): [T, U][];
  }
}
