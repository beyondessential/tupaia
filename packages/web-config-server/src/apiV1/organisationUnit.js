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
  // query our base entity
  const entity = await Entity.getEntityByCode(entityCode);
  if (!entity) {
    throw new Error(`Entity ${entityCode} not found`);
  }

  // check permission
  const hasAccess = await userHasAccess(entity.code);
  if (!hasAccess) {
    throw new Error(`No access to ${entity.code}`);
  }

  // fetch parent if one exists - don't check permission (as we already
  // know we have permission for at least one of its children)
  const entityParent = entity.parent_id && (await Entity.getEntity(entity.parent_id));
  const children = await fetchAndFilterForAccess(entity.getOrgUnitChildren(), userHasAccess);

  // assemble response
  const data = {
    ...translateForFrontend(entity),
    parent: translateForFrontend(entityParent),
    organisationUnitChildren: children.map(child => translateForFrontend(child)),
  };

  return data;
}

export async function getEntityAndDescendantsByCode(entityCode, userHasAccess) {
  const entityAndDescendants = await fetchAndFilterForAccess(
    Entity.getAllDescendantsWithCoordinates(entityCode),
    userHasAccess,
  );
  const entity = entityAndDescendants.shift(); // First entry should be the original entity
  if (!entity) {
    throw new Error(`Entity ${entityCode} not found`);
  } else if (entity.code !== entityCode) {
    throw new Error(`No access to ${entity.code}`);
  }

  const entityParent = entity.parent_code && (await Entity.getEntityByCode(entity.parent_code));

  // assemble response
  const data = {
    ...translateForFrontend(entity),
    parent: translateForFrontend(entityParent),
    descendants: entityAndDescendants.map(descendant => translateForFrontend(descendant)),
  };

  return data;
}

/**
 * Fetch all org units and filter for those that have access
 * @param {Function to fetch org units} orgUnitFetcher
 * @param {Function to determine org unit access} userHasAccess
 */
const fetchAndFilterForAccess = async (orgUnitFetcher, userHasAccess) => {
  const orgUnits = (
    await Promise.all(
      (await orgUnitFetcher).map(async orgUnit => (await userHasAccess(orgUnit.code)) && orgUnit),
    )
  ).filter(orgUnit => orgUnit);

  return orgUnits;
};

export async function getOrganisationUnitHandler(req, res) {
  const { organisationUnitCode, descendants } = req.query;
  const data =
    descendants === 'true'
      ? await getEntityAndDescendantsByCode(organisationUnitCode, req.userHasAccess)
      : await getEntityAndChildrenByCode(organisationUnitCode, req.userHasAccess);

  res.send(data);
}
