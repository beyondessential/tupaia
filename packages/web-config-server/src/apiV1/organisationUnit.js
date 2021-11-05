/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

const translateDescendantForFrontEnd = (descendant, childIdToParentId, entityIdToCode) => ({
  ...descendant.translateForFrontend(),
  parent: entityIdToCode[childIdToParentId[descendant.id]],
});

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker; // checks the user has access to requested entity

  async buildResponse() {
    const { includeCountryData } = this.query;
    const project = await this.fetchAndCacheProject();

    // If this is a project entity, get entitiesWithAccess and set them on the entity
    if (this.entity.isProject()) {
      const orgUnits = await this.entity.getChildren(project.entity_hierarchy_id);

      const entitiesWithAccessInfo = await Promise.all(
        orgUnits.map(async orgUnit => ({
          ...orgUnit,
          hasAccess: await this.checkUserHasEntityAccess(orgUnit),
        })),
      );

      this.entity.entitiesWithAccess = entitiesWithAccessInfo.filter(e => e.hasAccess);
    }

    return includeCountryData === 'true'
      ? this.getEntityAndCountryDataByCode(project)
      : this.getEntityAndChildrenByCode(project);
  }

  async getEntityAndCountryDataByCode(project) {
    const { userHasAccess } = this.req;
    const projectEntity = await project.entity();
    const country = await this.entity.countryEntity();
    if (!(await userHasAccess(country))) {
      return {};
    }

    const typesExcludedFromWebFrontend = await this.fetchTypesExcludedFromWebFrontend(project);
    const countryDescendants = country
      ? await country.getDescendants(project.entity_hierarchy_id, {
          type: {
            comparator: 'not in',
            comparisonValue: typesExcludedFromWebFrontend,
          },
        })
      : [];

    const orgUnitHierarchy = [projectEntity].concat([country]).concat(countryDescendants);

    const childIdToParentId = await this.models.ancestorDescendantRelation.getChildIdToParentId(
      project.entity_hierarchy_id,
    );

    const entityIdToCode = reduceToDictionary(orgUnitHierarchy, 'id', 'code');
    return {
      ...this.entity.translateForFrontend(),
      countryHierarchy: orgUnitHierarchy.map(e =>
        translateDescendantForFrontEnd(e, childIdToParentId, entityIdToCode),
      ),
    };
  }

  async getEntityAndChildrenByCode(project) {
    // Don't check parent permission (as we already know we have permission for at least one of its children)
    const parent = await this.entity.getParent(project.entity_hierarchy_id);
    const allChildren = await this.entity.getChildren(project.entity_hierarchy_id);
    const children = await this.filterForAccess(allChildren);

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
        entities
          .filter(entity => entity)
          .map(async entity => (await this.checkUserHasEntityAccess(entity)) && entity),
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
