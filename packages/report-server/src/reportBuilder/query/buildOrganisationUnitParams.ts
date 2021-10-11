/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ReqContext } from '../context';
import { FetchReportQuery, ReportConfig } from '../../types';

const REQUESTED_ORG_UNITS_PLACEHOLDER = '$requested';

export const buildOrganisationUnitParams = async (
  ctx: ReqContext,
  query: FetchReportQuery,
  config: ReportConfig,
) => {
  const { hierarchy, accessPolicy, permissionGroup } = ctx;
  const { organisationUnitCodes: requestedCodes } = query;
  const { organisationUnits: organisationUnitsSpec } = config.fetch;

  if (!organisationUnitsSpec) return requestedCodes;

  const codes: string[] = [];
  const codesToFetch: string[] = []; // must fetch codes from entityApi to ensure we have permissions
  organisationUnitsSpec.forEach(organisationUnit => {
    if (organisationUnit === REQUESTED_ORG_UNITS_PLACEHOLDER) {
      codes.push(...requestedCodes);
    } else {
      codesToFetch.push(organisationUnit);
    }
  });

  const fetchedEntities = await ctx.services.entity.getEntities(hierarchy, codesToFetch, {
    fields: ['code', 'country_code', 'type'],
  });

  const fetchedCodesWithAccess = fetchedEntities
    .filter(({ type }) => type !== 'project') // Can't fetch at project level due to permissions, not supported for now
    .filter(({ country_code }) => country_code !== null)
    .filter(({ country_code }) =>
      accessPolicy.allows(country_code as Exclude<typeof country_code, null>, permissionGroup),
    )
    .map(({ code }) => code);

  codes.push(...fetchedCodesWithAccess);

  return codes;
};
