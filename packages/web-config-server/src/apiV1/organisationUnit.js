import { Entity } from '/models';

import { getEntityLocationForFrontend } from './utils/getEntityLocationForFrontend';

function getOrganisationUnitTypeForFrontend(type) {
  switch (type) {
    case 'region':
      return 'Region';
    case 'country':
      return 'Country';
    case 'facility':
      return 'Facility';
    default:
      return 'Other';
  }
}

export function translateForFrontend(entity) {
  // Sometimes we'll end up with a null entity (eg getting a top-level entity's parent).
  // Frontend expects an empty object rather than null.
  if (!entity) return {};

  return {
    type: getOrganisationUnitTypeForFrontend(entity.type),
    organisationUnitCode: entity.code,
    countryCode: entity.country_code,
    name: entity.name,
    location: getEntityLocationForFrontend(entity),
    photoUrl: entity.image_url,
  };
}

export async function getEntityByCode(entityCode, userHasAccess) {
  // query our base entity
  const queriedEntity = await Entity.getEntityByCode(entityCode);
  if (!queriedEntity) {
    throw new Error(`Entity ${entityCode} not found`);
  }

  // check permission
  const hasAccess = await userHasAccess(queriedEntity.code);
  if (!hasAccess) {
    throw new Error(`No access to ${queriedEntity.code}`);
  }

  // fetch parent if one exists - don't check permission (as we already
  // know we have permission for at least one of its children)
  const { parent_id: parentId, id: entityId } = queriedEntity;
  const parentTask = parentId && Entity.getEntity(parentId);
  const children = await Promise.all(await getEntityChildren(entityId, userHasAccess));

  // assemble response
  const data = {
    ...translateForFrontend(queriedEntity),
    parent: translateForFrontend(await parentTask),
    organisationUnitChildren: children,
  };

  return data;
}

/**
 * Recursively get all children, filtering out those we don't have permission for
 */
async function getEntityChildren(entityId, userHasAccess) {
  if (await !Entity.orgUnitHasChildren(entityId)) {
    return [];
  }

  const childrenTask = Entity.getOrgUnitChildren(entityId);
  const children = (
    await Promise.all((await childrenTask).map(async c => (await userHasAccess(c.code)) && c))
  )
    .filter(c => c)
    .map(async child => ({
      ...translateForFrontend(child),
      // organisationUnitChildren: await Promise.all(await getEntityChildren(child.id, userHasAccess)),
    }));

  return children;
}

export async function getOrganisationUnitHandler(req, res) {
  const { organisationUnitCode } = req.query;

  const data = await getEntityByCode(organisationUnitCode, req.userHasAccess);

  res.send(data);
}
