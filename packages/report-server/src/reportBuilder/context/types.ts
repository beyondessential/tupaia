/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface Context {
  orgUnits?: { code: string; name: string, id: string }[];
  dataElementCodeToName?: Record<string, string>;
}

export type ContextProp = keyof Context;
