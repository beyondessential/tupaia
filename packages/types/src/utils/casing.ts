/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

// generic camel case type, that handles dots and underscores for cases where the response is like 'item.test_item_key
type CamelCase<S extends string> = S extends `${infer Prefix}.${infer Suffix}`
  ? `${CamelCasePart<Prefix>}${Capitalize<CamelCase<Suffix>>}`
  : S extends `${infer Prefix}_${infer Suffix}`
  ? `${Prefix}${Capitalize<CamelCase<Suffix>>}`
  : CamelCasePart<S>;

type CamelCasePart<S extends string> = S extends `${infer First}_${infer Rest}`
  ? `${Lowercase<First>}${CamelCasePart<Capitalize<Rest>>}`
  : S;

// Converts a type object to camel case, from snake case
export type ObjectToCamel<T> = {
  [K in keyof T as CamelCase<string & K>]: KeysToCamelCase<T[K]>;
};

// Converts type objects or arrays to camel case
export type KeysToCamelCase<T> = T extends Array<infer ArrayElm>
  ? KeysToCamelCase<ArrayElm>[] // If array, camel case items
  : ObjectToCamel<T>; // If object, camel case keys;
