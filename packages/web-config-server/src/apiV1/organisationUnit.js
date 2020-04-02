import { Entity } from '/models';
import { getEntityLocationForFrontend, getOrganisationUnitTypeForFrontend } from './utils';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

const WORLD = 'World';

export const translateForFrontend = entity => {
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
};

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
    const country = await this.entity.countryEntity();

    const orgUnitHierarchy = [await Entity.findOne({ code: WORLD })];
    const countryAndDescendants = await country.getDescendantsAndSelf();
    orgUnitHierarchy.push(...countryAndDescendants);

    return {
      ...translateForFrontend(this.entity),
      countryHierarchy: orgUnitHierarchy.map(translateDescendantForFrontEnd),
    };
  }

  async getEntityAndChildrenByCode() {
    // Don't check parent permission (as we already know we have permission for at least one of its children)
    const parent = await this.entity.parent();
    const children = await this.getOrgUnitChildrenWithAccess();

    return {
      ...translateForFrontend(this.entity),
      parent: translateForFrontend(parent),
      organisationUnitChildren: children.map(translateForFrontend),
    };
  }

  async getOrgUnitChildrenWithAccess() {
    const { userHasAccess } = this.req;
    const children = await this.entity.getOrgUnitChildren();

    if (this.entity.code === WORLD) {
      return (
        await Promise.all(children.map(async child => (await userHasAccess(child)) && child))
      ).filter(child => child);
    }

    return children;
  }
}
