/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ReqContext } from '../../../../context';

type FetchedEntity = { code: string; country_code: string | null; type: string };

const fetchEntityObjects = async (ctx: ReqContext, hierarchy: string, codes: string[]) => {
  const entities = (await ctx.services.entity.getEntities(hierarchy, codes, {
    fields: ['code', 'country_code', 'type'],
  })) as FetchedEntity[];

  const projectCodes = entities.filter(entity => entity.type === 'project').map(({ code }) => code);
  const countriesInProjects = (await ctx.services.entity.getDescendantsOfEntities(
    hierarchy,
    projectCodes,
    {
      fields: ['code', 'country_code', 'type'],
      filter: { type: 'country' },
    },
    false,
  )) as FetchedEntity[];

  const allEntities = entities.concat(countriesInProjects);
  const uniqueEntities = allEntities.filter(
    (entity, index) =>
      allEntities.findIndex(otherEntity => entity.code === otherEntity.code) === index,
  );

  return uniqueEntities;
};

export const buildOrganisationUnitParams = async (
  ctx: ReqContext,
  config: { hierarchy?: string; organisationUnits?: string[] },
) => {
  const { accessPolicy, permissionGroup, query } = ctx;
  const { hierarchy = query.hierarchy, organisationUnits = query.organisationUnitCodes } = config;

  if (organisationUnits.length === 0) {
    throw new Error(
      "Must provide 'organisationUnitCodes' URL parameter, or 'organisationUnits' in fetch config",
    );
  }

  const fetchedEntities = await fetchEntityObjects(ctx, hierarchy, organisationUnits);

  if (fetchedEntities.length === 0) {
    throw new Error(`No entities found with codes: ${organisationUnits}`);
  }

  const codesWithAccess = fetchedEntities
    .filter(({ country_code }) => country_code !== null)
    .filter(({ country_code }) =>
      accessPolicy.allows(country_code as Exclude<typeof country_code, null>, permissionGroup),
    )
    .map(({ code }: { code: string }) => code);

  if (codesWithAccess.length === 0) {
    throw new Error(`No '${permissionGroup}' access to any one of entities: ${organisationUnits}`);
  }

  return codesWithAccess;
};
