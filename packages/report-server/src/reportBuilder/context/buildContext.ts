import { uniq } from 'es-toolkit';
import { Row } from '../types';

import { Transform } from '@tupaia/types';
import { detectDependencies } from './detectDependencies';
import { Context, ContextDependency, ReqContext } from './types';

type ContextBuilder<K extends ContextDependency> = (
  reqContext: ReqContext,
  data: Row[],
) => Promise<Context[K]>;

const isEventResponse = (data: Row[]) => data.some(result => 'event' in result);

const getOrgUnitCodesFromData = (data: Row[]) => {
  return uniq(
    isEventResponse(data) ? data.map(d => d.orgUnit) : data.map(d => d.organisationUnit),
  ) as string[];
};

const buildOrgUnits = async (reqContext: ReqContext, data: Row[]) => {
  const orgUnitCodes = getOrgUnitCodesFromData(data);

  return reqContext.services.entity.getEntities(reqContext.hierarchy, orgUnitCodes, {
    fields: ['code', 'name', 'id', 'attributes'],
  });
};

const contextBuilders: Record<ContextDependency, ContextBuilder<ContextDependency>> = {
  orgUnits: buildOrgUnits,
};

function validateDependency(key: string): asserts key is keyof typeof contextBuilders {
  if (!(key in contextBuilders)) {
    throw new Error(
      `Invalid context dependency: ${key}, must be one of ${Object.keys(contextBuilders)}`,
    );
  }
}

const setContextValue = <Key extends ContextDependency>(
  context: Context,
  key: Key,
  value: Context[Key],
) => {
  context[key] = value;
};

export const updateContext = async (context: Context, data: Row[]): Promise<Context> => {
  for (const key of context.dependencies) {
    validateDependency(key);
    setContextValue(context, key, await contextBuilders[key](context.request, data));
  }

  return context;
};

export const buildContext = async (
  transform: Transform[],
  reqContext: ReqContext,
): Promise<Context> => {
  const dependencies = detectDependencies(transform);

  const context: Context = { request: reqContext, dependencies };
  return context;
};
