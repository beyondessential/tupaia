import { reduceToDictionary } from '@tupaia/utils';

import { Context, ContextDependency } from '../../../context';

/**
 * Config for functions that use `context`
 *
 * `dependencies`: declares the part of the context that will be used by the function
 * `func`: factory method that creates a closure that can access the context
 */
type ContextFunctionConfig = {
  dependencies: ContextDependency[];
  func: (dependencies: { getContext: () => Context }) => (...args: any[]) => unknown;
};

export const orgUnitCodeToName: ContextFunctionConfig = {
  dependencies: ['orgUnits'],
  func: ({ getContext }) => (orgUnitCode: string) => {
    const { orgUnits } = getContext();
    if (!orgUnits) {
      throw new Error("Missing dependency 'orgUnits' required by 'orgUnitCodeToName()'");
    }
    const codeToName = reduceToDictionary(orgUnits, 'code', 'name');
    return codeToName[orgUnitCode];
  },
};
