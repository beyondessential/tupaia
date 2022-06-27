/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

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

export const dataElementCodeToName: ContextFunctionConfig = {
  dependencies: ['dataElementCodeToName'],
  func: ({ getContext }) => (dataElementCode: string) => {
    const { dataElementCodeToName: codeToNameMap } = getContext();
    if (!codeToNameMap) {
      throw new Error(
        "Missing dependency 'dataElementCodeToName' required by 'dataElementCodeToName()'",
      );
    }
    return codeToNameMap[dataElementCode];
  },
};

export const orgUnitIdToCode: ContextFunctionConfig = {
  dependencies: ['orgUnits'],
  func: ({ getContext }) => (orgUnitId: string) => {
    const { orgUnits } = getContext();
    if (!orgUnits) {
      throw new Error("Missing dependency 'orgUnits' required by 'orgUnitIdToCode()'");
    }
    const idToCode = reduceToDictionary(orgUnits, 'id', 'code');
    return idToCode[orgUnitId];
  },
};

export const orgUnitAttribute: ContextFunctionConfig = {
  dependencies: ['orgUnits'],
  func: ({ getContext }) => (orgUnitCode: string, attributeKey: string) => {
    const { orgUnits } = getContext();
    if (!orgUnits) {
      throw new Error("Missing dependency 'orgUnits' required by 'orgUnitAttribute()'");
    }
    if (!orgUnitCode)  throw new Error("Missing first argument 'orgUnitCode' required by 'orgUnitAttribute()'");
    if (!attributeKey) throw new Error("Missing second argument 'attributeKey' required by 'orgUnitAttribute()'");
    const orgUnit = orgUnits.find(orgUnit => orgUnit.code === orgUnitCode);
    if (!orgUnit) {
      throw new Error(`No org unit found with code "${orgUnitCode}" in orgUnitAttribute()`);
    }
    const { attributes = {} } = orgUnit;
    return attributes[attributeKey];
  },
};
