/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

export type Context<T> = {
  [field in keyof T]: T[field];
};
