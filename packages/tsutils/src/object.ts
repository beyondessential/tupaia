/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const objectEntries = <U, T extends string | number | symbol>(
  o: { [key in T]: U } | ArrayLike<U>,
): [T, U][] => {
  return Object.entries(o) as [T, U][];
};

export const objectKeys = <T extends string | number | symbol>(
  o: { [key in T]: unknown } | ArrayLike<unknown>,
): T[] => {
  return Object.keys(o) as T[];
};
