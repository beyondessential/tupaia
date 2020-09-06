/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { Project, Entity, EntityRelation } from '/models';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

const translateDescendantForFrontEnd = (descendant, childIdToParentId, entityIdToCode) => ({
  ...descendant.translateForFrontend(),
  parent: entityIdToCode[childIdToParentId[descendant.id]],
});

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker; // checks the user has access to requested entity

  async buildResponse() {
    const { includeCountryData, projectCode = 'explore' } = this.query;
    return includeCountryData === 'true'
      ? this.getEntityAndCountryDataByCode(projectCode)
      : this.getEntityAndChildrenByCode(projectCode);
  }

  async getEntityAndCountryDataByCode(projectCode) {
    const project = await Project.findOne({ code: projectCode });
    const projectEntity = await Entity.findOne({ id: project.entity_id });
    const country = await this.entity.country();
    const countryDescendants = country
      ? await country.getDescendants(project.entity_hierarchy_id)
      : [];
    const orgUnitHierarchy = await this.filterForAccess([
      projectEntity,
      country,
      ...countryDescendants,
    ]);

    // todo replace with AncestorDescendantRelation, then remove EntityRelation model
    const childIdToParentId = await EntityRelation.getChildIdToParentIdMap(
      project.entity_hierarchy_id,
    );
    // Fill in childIdToParentId with missing org units
    orgUnitHierarchy.forEach(({ id, parent_id: parentId }) => {
      if (!childIdToParentId[id]) {
        childIdToParentId[id] = parentId;
      }
    });

    const entityIdToCode = reduceToDictionary(orgUnitHierarchy, 'id', 'code');
    return {
      ...this.entity.translateForFrontend(),
      countryHierarchy: orgUnitHierarchy.map(e =>
        translateDescendantForFrontEnd(e, childIdToParentId, entityIdToCode),
      ),
    };
  }

  async getEntityAndChildrenByCode(projectCode) {
    const project = await Project.findOne({ code: projectCode });

    // Don't check parent permission (as we already know we have permission for at least one of its children)
    const parent = await this.entity.parent();
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
