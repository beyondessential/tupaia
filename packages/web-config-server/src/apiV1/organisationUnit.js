import { Entity } from '/models';
import { getEntityLocationForFrontend, getOrganisationUnitTypeForFrontend } from './utils';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

function translateForFrontend(entity) {
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

const translateDescendantForFrontEnd = descendant => ({
  ...translateForFrontend(descendant),
  parent: descendant.parent_code,
});

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker; // checks the user has access to requested entity

  async buildResponse() {
    const { includeCountryHierarchy } = this.query;
    return includeCountryHierarchy === 'true'
      ? this.getEntityAndCountryHierarchyByCode()
      : this.getEntityAndChildrenByCode();
  }

  async getEntityAndCountryHierarchyByCode() {
    const country = this.entity.isCountry()
      ? this.entity
      : await Entity.findOne({ code: this.entity.country_code });
    const countryAndDescendants = await this.filterForAccess(await country.getDescendantsAndSelf());
    countryAndDescendants.unshift(await Entity.findOne({ code: 'World' })); // Hierarchy is missing world entity, so push it to the front of the array

    return {
      ...translateForFrontend(this.entity),
      countryHierarchy: countryAndDescendants.map(translateDescendantForFrontEnd),
    };
  }

  async getEntityAndChildrenByCode() {
    // Don't check parent permission (as we already know we have permission for at least one of its children)
    const parent = await this.entity.parent();
    const children = await this.filterForAccess(await this.entity.getOrgUnitChildren());

    return {
      ...translateForFrontend(this.entity),
      parent: translateForFrontend(parent),
      organisationUnitChildren: children.map(translateForFrontend),
    };
  }

  async filterForAccess(orgUnits) {
    const { userHasAccess } = this.req;
    return (
      await Promise.all(
        orgUnits.map(async orgUnit => (await userHasAccess(orgUnit.code)) && orgUnit),
      )
    ).filter(orgUnit => orgUnit);
  }
}
