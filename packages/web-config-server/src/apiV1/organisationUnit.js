import { Entity } from '/models';
import { getEntityLocationForFrontend } from './utils/getEntityLocationForFrontend';

function getOrganisationUnitTypeForFrontend(type) {
  switch (type) {
    case 'country':
      return 'Country';
    case 'region':
      return 'Region';
    case 'facility':
      return 'Facility';
    case 'village':
      return 'Village';
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

  // get children & remove those we don't have permission for
  const childrenTask = queriedEntity.getOrgUnitChildren();
  const children = (
    await Promise.all((await childrenTask).map(async c => (await userHasAccess(c.code)) && c))
  )
    .filter(c => c)
    .map(translateForFrontend);

  // assemble response
  const data = {
    ...translateForFrontend(queriedEntity),
    // no need to check permissions for the parent, since we have permission for one of its children
    parent: translateForFrontend(await queriedEntity.parent()),
    organisationUnitChildren: children,
  };

  return data;
}

export async function getOrganisationUnitHandler(req, res) {
  const { organisationUnitCode } = req.query;

  const data = await getEntityByCode(organisationUnitCode, req.userHasAccess);

  res.send(data);
}
