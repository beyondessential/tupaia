/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export interface Context {
  orgUnitMap: Record<string, { code: string; name: string }>;
}

export type ContextProp = keyof Context;
