import { Entity } from '/models';
import { getEntityLocationForFrontend, getOrganisationUnitTypeForFrontend } from './utils';

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
    parent: entity.parent_code,
  };
}

export async function getEntityAndChildrenByCode(entityCode, userHasAccess) {
  const entity = await Entity.getEntityByCode(entityCode);
  checkExistsAndHasAccess(entity, entityCode, userHasAccess);

  // Don't check parent permission (as we already know we have permission for at least one of its children)
  const parent = entity.parent_id && (await Entity.findById(entity.parent_id));
  const children = await filterForAccess(await entity.getOrgUnitChildren(), userHasAccess);

  return {
    ...translateForFrontend(entity),
    parent: translateForFrontend(parent),
    organisationUnitChildren: children.map(translateForFrontend),
  };
}

export async function getEntityAndDescendantsByCode(entityCode, userHasAccess) {
  const entity = await Entity.getEntityByCode(entityCode);
  checkExistsAndHasAccess(entity, entityCode, userHasAccess);

  // Don't check parent permission (as we already know we have permission for at least one of its children)
  const parent = entity.parent_id && (await Entity.findById(entity.parent_id));
  const descendants = await filterForAccess(await entity.getDescendants(), userHasAccess);

  return {
    ...translateForFrontend(entity),
    parent: translateForFrontend(parent),
    descendants: descendants.map(translateForFrontend),
  };
}

const checkExistsAndHasAccess = async (entity, entityCode, userHasAccess) => {
  if (!entity) {
    throw new Error(`Entity ${entityCode} not found`);
  }

  if (!(await userHasAccess(entity.code))) {
    throw new Error(`No access to ${entity.code}`);
  }
};

const filterForAccess = async (orgUnits, userHasAccess) => {
  return (
    await Promise.all(orgUnits.map(async orgUnit => (await userHasAccess(orgUnit.code)) && orgUnit))
  ).filter(orgUnit => orgUnit);
};

export async function getOrganisationUnitHandler(req, res) {
  const { organisationUnitCode, includeDescendants } = req.query;
  const data =
    includeDescendants === 'true'
      ? await getEntityAndDescendantsByCode(organisationUnitCode, req.userHasAccess)
      : await getEntityAndChildrenByCode(organisationUnitCode, req.userHasAccess);

  res.send(data);
}
