/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { getUniqueEntries } from '@tupaia/utils';

import { FetchResponse } from '../fetch';
import { detectDependencies } from './detectDependencies';
import { Context, ContextDependency } from './types';
import { RequestContext } from '../../types';

export type ReqContext = {
  hierarchy: string;
  permissionGroup: string;
  services: RequestContext['services'];
  accessPolicy: AccessPolicy;
};

type ContextBuilder<K extends ContextDependency> = (
  reqContext: ReqContext,
  data: FetchResponse,
) => Promise<Context[K]>;

const isEventResponse = (data: FetchResponse) => data.results.some(result => 'event' in result);

const getOrgUnitCodesFromData = (data: FetchResponse) => {
  return getUniqueEntries(
    isEventResponse(data)
      ? data.results.map(d => d.orgUnit)
      : data.results.map(d => d.organisationUnit),
  );
};

const buildOrgUnits = async (reqContext: ReqContext, data: FetchResponse) => {
  const orgUnitCodes = getOrgUnitCodesFromData(data);

  return reqContext.services.entity.getEntities(reqContext.hierarchy, orgUnitCodes, {
    fields: ['code', 'name', 'id', 'attributes'],
  });
};

const buildDataElementCodeToName = async (reqContext: ReqContext, data: FetchResponse) => {
  return data.metadata?.dataElementCodeToName || {};
};

const buildFacilityCountByOrgUnit = async (reqContext: ReqContext, data: FetchResponse) => {
  const orgUnitCodes = getOrgUnitCodesFromData(data);

  const facilitiesByOrgUnitCode = await reqContext.services.entity.getRelationshipsOfEntities(
    reqContext.hierarchy,
    orgUnitCodes,
    'ancestor',
    {},
    {},
    { filter: { type: 'facility' } },
  );

  const facilityCountByOrgUnit = Object.fromEntries(
    Object.entries(facilitiesByOrgUnitCode).map(([orgUnit, facilities]) => [
      orgUnit,
      (facilities as any[]).length,
    ]),
  );

  return facilityCountByOrgUnit;
};

const contextBuilders: Record<ContextDependency, ContextBuilder<ContextDependency>> = {
  orgUnits: buildOrgUnits,
  dataElementCodeToName: buildDataElementCodeToName,
  facilityCountByOrgUnit: buildFacilityCountByOrgUnit,
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

export const buildContext = async (
  transform: unknown,
  reqContext: ReqContext,
  data: FetchResponse,
  query?: Record<string, unknown>,
): Promise<Context> => {
  const dependencies = detectDependencies(transform);

  const context: Context = query ? { query } : {};

  for (const key of dependencies) {
    validateDependency(key);
    setContextValue(context, key, await contextBuilders[key](reqContext, data));
  }

  return context;
};
