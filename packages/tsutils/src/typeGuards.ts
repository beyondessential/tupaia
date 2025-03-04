export const isDefined = <T>(value: T): value is Exclude<T, undefined> => value !== undefined;

export const isNotNullish = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null;

export function assertIsNotNullish<T>(val: T): asserts val is NonNullable<T> {
  if (!isNotNullish(val)) {
    throw new Error(`Expected value to be defined, but got ${val}`);
  }
}

export const ensure = <T>(val: T) => {
  assertIsNotNullish(val);
  return val;
};

export const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);
