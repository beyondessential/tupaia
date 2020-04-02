/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
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

const translateDescendantForFrontEnd = (descendant, entityIdToCode) => ({
  ...translateForFrontend(descendant),
  parent: entityIdToCode[descendant.parent_id],
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
    const countryAndDescendants = await this.filterForAccess(await country.getDescendantsAndSelf());
    orgUnitHierarchy.push(...countryAndDescendants);
    const entityIdToCode = reduceToDictionary(countryAndDescendants, 'id', 'code');
    return {
      ...translateForFrontend(this.entity),
      countryHierarchy: orgUnitHierarchy.map(e =>
        translateDescendantForFrontEnd(e, entityIdToCode),
      ),
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

  async filterForAccess(entities) {
    return (
      await Promise.all(
        entities.map(async entity => (await this.checkUserHasEntityAccess(entity)) && entity),
      )
    ).filter(entity => entity);
  }

  checkUserHasEntityAccess = async entity => {
    const { userHasAccess } = this.req;
    if (entity.isCountry()) {
      return userHasAccess(entity);
    }
    return true; // temporarily only checking access at the country level (permissions currently defined for country only)
  };
}
