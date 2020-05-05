/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { Entity, EntityHierarchy, EntityRelation } from '/models';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';
import { Project } from '../models';

const translateDescendantForFrontEnd = (descendant, childIdToParentId, entityIdToCode) => ({
  ...descendant.translateForFrontend(),
  parent: entityIdToCode[childIdToParentId[descendant.id]],
});

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker; // checks the user has access to requested entity

  async buildResponse() {
    const { includeCountryData, projectCode = 'explore' } = this.query;
    return includeCountryData === 'true'
      ? this.getEntityAndCountryHierarchyByCode(projectCode)
      : this.getEntityAndChildrenByCode(projectCode);
  }

  async getEntityAndCountryHierarchyByCode(projectCode) {
    const project = await Project.findOne({ code: projectCode });
    const projectEntity = await Entity.findOne({ id: project.entity_id });
    const hierarchy = await EntityHierarchy.findOne({ name: projectCode });
    const country = await this.entity.countryEntity();
    const countryDescendants = await country.getDescendants(hierarchy.id);
    const orgUnitHierarchy = await this.filterForAccess([
      projectEntity,
      country,
      ...countryDescendants,
    ]);

    const childIdToParentId = hierarchy
      ? reduceToDictionary(
          await EntityRelation.find({ entity_hierarchy_id: hierarchy.id }),
          'child_id',
          'parent_id',
        )
      : {};
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
    const hierarchy = await EntityHierarchy.findOne({ name: projectCode });

    // Don't check parent permission (as we already know we have permission for at least one of its children)
    const parent = await this.entity.parent();
    const allChildren = hierarchy
      ? await this.entity.getChildren(hierarchy.id)
      : await this.entity.getOrgUnitChildren();

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
