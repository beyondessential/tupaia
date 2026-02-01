export const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export function isEmpty(val: unknown): val is null | undefined | '' {
  return val === '' || val === undefined || val === null;
}

export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined;
}

export const isNotNullish = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null;

export function assertIsNotNullish<T>(val: T, message?: string): asserts val is NonNullable<T> {
  if (isNullish(val)) {
    throw new UnexpectedNullishValueError(message ?? `Expected non-nullish value, but got ${val}`);
  }
}

export function ensure<T>(val: T, message?: string): NonNullable<T> {
  assertIsNotNullish(val, message);
  return val;
}

export const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

export function isEmptyArray(val: unknown): val is [] {
  return Array.isArray(val) && val.length === 0;
}

export function isNonEmptyArray<T = unknown>(val: unknown): val is [T, ...T[]] {
  return Array.isArray(val) && val.length > 0;
}

type Primitive = null | undefined | boolean | number | string | bigint | symbol;

export function isPrimitive(val: unknown): val is Primitive {
  return (
    val === null ||
    val === undefined ||
    typeof val === 'boolean' ||
    typeof val === 'number' ||
    typeof val === 'string' ||
    typeof val === 'bigint' ||
    typeof val === 'symbol'
  );
}

export class UnexpectedNullishValueError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UnexpectedNullishValueError';
  }
}
