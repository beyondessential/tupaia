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
    facilityTypeCode: entity.clinic_category_code,
    facilityTypeName: entity.clinic_type_name,
    parent: entity.parent_code,
  };
}

export async function getEntityAndChildrenByCode(entityCode, userHasAccess) {
  const entity = await Entity.getEntityByCode(entityCode);
  checkExistsAndHasAccess(entity, entityCode, userHasAccess);

  // Don't check parent permission (as we already know we have permission for at least one of its children)
  const entityParent = entity.parent_id && (await Entity.getEntity(entity.parent_id));
  const children = await filterForAccess(await entity.getOrgUnitChildren(), userHasAccess);

  return {
    ...translateForFrontend(entity),
    parent: translateForFrontend(entityParent),
    organisationUnitChildren: children.map(child => translateForFrontend(child)),
  };
}

export async function getEntityAndDescendantsByCode(entityCode, userHasAccess) {
  const entityAndDescendants = await Entity.getAllDescendantsWithCoordinates(entityCode);
  const entity = entityAndDescendants.shift(); // First entry should be the original entity
  checkExistsAndHasAccess(entity, entityCode, userHasAccess);

  // Don't check parent permission (as we already know we have permission for at least one of its children)
  const entityParent = entity.parent_code && (await Entity.getEntityByCode(entity.parent_code));
  const descendants = await filterForAccess(entityAndDescendants, userHasAccess);

  return {
    ...translateForFrontend(entity),
    parent: translateForFrontend(entityParent),
    descendants: descendants.map(descendant => translateForFrontend(descendant)),
  };
}

const checkExistsAndHasAccess = async (entity, entityCode, userHasAccess) => {
  if (!entity) {
    throw new Error(`Entity ${entityCode} not found`);
  } else if (!(await userHasAccess(entity.code))) {
    throw new Error(`No access to ${entity.code}`);
  }
};

const filterForAccess = async (orgUnits, userHasAccess) => {
  return (
    await Promise.all(orgUnits.map(async orgUnit => (await userHasAccess(orgUnit.code)) && orgUnit))
  ).filter(orgUnit => orgUnit);
};

export async function getOrganisationUnitHandler(req, res) {
  const { organisationUnitCode, descendants } = req.query;
  const data =
    descendants === 'true'
      ? await getEntityAndDescendantsByCode(organisationUnitCode, req.userHasAccess)
      : await getEntityAndChildrenByCode(organisationUnitCode, req.userHasAccess);

  res.send(data);
}
