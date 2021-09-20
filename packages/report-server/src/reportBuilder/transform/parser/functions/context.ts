/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';

import { Context, ContextProp } from '../../../context';

/**
 * `contextProps`: props that will be required by the function
 * `create`: factory method that creates the function by injecting the context
 */
type ContextParams = {
  contextProps: ContextProp[];
  create: (deps: { getContext: () => Context }) => (...args: any[]) => unknown;
};

export const orgUnitCodeToName: ContextParams = {
  contextProps: ['orgUnitMap'],
  create: ({ getContext }) => (orgUnitCode: string) => {
    const { orgUnitMap } = getContext();
    const codeToName = reduceToDictionary(Object.values(orgUnitMap), 'code', 'name');
    return codeToName[orgUnitCode];
  },
};
