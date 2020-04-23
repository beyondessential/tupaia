/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { Entity } from '/models';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

const WORLD = 'World';

const translateDescendantForFrontEnd = (descendant, entityIdToCode) => ({
  ...descendant.translateForFrontend(),
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
    const world = await Entity.findOne({ code: WORLD });
    const country = await this.entity.countryEntity();
    const countryDescendants = await country.getDescendants();
    const orgUnitHierarchy = await this.filterForAccess([world, country, ...countryDescendants]);
    const entityIdToCode = reduceToDictionary(orgUnitHierarchy, 'id', 'code');
    return {
      ...this.entity.translateForFrontend(),
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
      ...this.entity.translateForFrontend(),
      // parent may be `null` (eg getting a top-level entity's parent)
      parent: parent ? parent.translateForFrontend() : {},
      organisationUnitChildren: children.map(child => child.translateForFrontend()),
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
