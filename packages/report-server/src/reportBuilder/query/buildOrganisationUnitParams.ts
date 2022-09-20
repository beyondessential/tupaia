/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { ReqContext } from '../context';
import { FetchReportQuery, ReportConfig } from '../../types';

const REQUESTED_ORG_UNITS_PLACEHOLDER = '$requested';

const fetchEntityObjects = async (ctx: ReqContext, hierarchy: string, codes: string[]) => {
  const entities = await ctx.services.entity.getEntities(hierarchy, codes, {
    fields: ['code', 'country_code', 'type'],
  });

  const countryOrLowerEntities = (
    await Promise.all(
      entities.map(async (entity: any) => {
        if (entity.type !== 'project') {
          return entity;
        }

        const countryEntities = await ctx.services.entity.getDescendantsOfEntities(
          hierarchy,
          codes,
          {
            fields: ['code', 'country_code', 'type'],
            filter: { type: 'country' },
          },
          false,
        );

        return countryEntities;
      }),
    )
  ).flat();

  return Object.values(keyBy(countryOrLowerEntities, 'code'));
};

const getCodesToFetch = (requestedCodes: string[], organisationUnitsSpec?: string[]) => {
  if (!organisationUnitsSpec) return requestedCodes;

  const codesToFetch: string[] = []; // must fetch codes from entityApi to ensure we have permissions
  organisationUnitsSpec.forEach(organisationUnit => {
    if (organisationUnit === REQUESTED_ORG_UNITS_PLACEHOLDER) {
      codesToFetch.push(...requestedCodes);
    } else {
      codesToFetch.push(organisationUnit);
    }
  });

  return codesToFetch;
};

export const buildOrganisationUnitParams = async (
  ctx: ReqContext,
  query: FetchReportQuery,
  config: ReportConfig,
) => {
  const { hierarchy, accessPolicy, permissionGroup } = ctx;
  const { organisationUnitCodes: requestedCodes } = query;
  const { organisationUnits: organisationUnitsSpec } = config.fetch;

  const codesToFetch = getCodesToFetch(requestedCodes, organisationUnitsSpec);

  if (codesToFetch.length === 0) {
    throw new Error(
      "Must provide 'organisationUnitCodes' URL parameter, or 'organisationUnits' in fetch config",
    );
  }

  const fetchedEntities: any[] = await fetchEntityObjects(ctx, hierarchy, codesToFetch);

  const codesWithAccess = fetchedEntities
    .filter(({ country_code }) => country_code !== null)
    .filter(({ country_code }) =>
      accessPolicy.allows(country_code as Exclude<typeof country_code, null>, permissionGroup),
    )
    .map(({ code }: { code: string }) => code);

  if (codesWithAccess.length === 0) {
    throw new Error(`No '${permissionGroup}' access to any one of entities: ${codesToFetch}`);
  }

  return codesWithAccess;
};
