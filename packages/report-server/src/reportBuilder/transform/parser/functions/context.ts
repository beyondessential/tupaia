/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';

import { Context, ContextProp } from '../../../context';

/**
 * Config for functions that use `context`
 *
 * `contextProps`: declares the part of the context that will be used by the function
 * `create`: factory method that creates a closure that can access the context
 */
type ContextFunctionConfig = {
  contextProps: ContextProp[];
  create: (dependencies: { getContext: () => Context }) => (...args: any[]) => unknown;
};

export const orgUnitCodeToName: ContextFunctionConfig = {
  contextProps: ['orgUnits'],
  create: ({ getContext }) => (orgUnitCode: string) => {
    const { orgUnits } = getContext();
    const codeToName = reduceToDictionary(orgUnits, 'code', 'name');
    return codeToName[orgUnitCode];
  },
};
