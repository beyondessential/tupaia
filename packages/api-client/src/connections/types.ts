/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

// Using a mapped type will strip out private properties of a class
export type PublicInterface<T> = {
  [Prop in keyof T]: T[Prop];
};
