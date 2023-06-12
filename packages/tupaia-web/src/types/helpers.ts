// Converts a type key to camel case, from snake case
export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

// Converts a type object to camel case, from snake case
export type ObjectToCamel<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, any>
    ? KeysToCamelCase<T[K]>
    : T[K];
};

// Converts type objects or arrays to camel case
export type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Array<any>
    ? KeysToCamelCase<T[K][number]>[]
    : ObjectToCamel<T[K]>;
};
