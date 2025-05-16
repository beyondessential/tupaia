/*
 * Duplicated from @tupaia/tsutils, which cannot (currently!) be used as a dependency of our front-end
 * packages due some incompatibilities with its transitive dependencies (as of May 2024).
 */

export function isEmptyArray(val: unknown): val is [] {
  return Array.isArray(val) && val.length === 0;
}

export function isNonEmptyArray<T = unknown>(val: unknown): val is [T, ...T[]] {
  return Array.isArray(val) && val.length > 0;
}

export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined;
}

export function isNotNullish<T>(val: T): val is NonNullable<T> {
  return val !== null && val !== undefined;
}

type Primitive = null | undefined | boolean | number | string | bigint | symbol;
export function isPrimitive(val: unknown): val is Primitive {
  return (
    val === null ||
    val === undefined ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean' ||
    typeof val === 'bigint' ||
    typeof val === 'symbol'
  );
}

/* Custom to @tupaia/datatrak-web */

type PrimitiveReactNode = null | undefined | boolean | number | string;
export function isPrimitiveReactNode(val: unknown): val is PrimitiveReactNode {
  return (
    val === null ||
    val === undefined ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  );
}
