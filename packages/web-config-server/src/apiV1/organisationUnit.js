/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { Entity, EntityHierarchy, EntityRelation } from '/models';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';
import { Project } from '../models';

const WORLD = 'World';

const translateDescendantForFrontEnd = (descendant, childIdToParentId, entityIdToCode) => ({
  ...descendant.translateForFrontend(),
  parent: entityIdToCode[childIdToParentId[descendant.id]],
});

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker; // checks the user has access to requested entity

  async buildResponse() {
    const { includeCountryData, projectCode } = this.query;
    return includeCountryData === 'true'
      ? this.getEntityAndCountryHierarchyByCode(projectCode)
      : this.getEntityAndChildrenByCode(projectCode);
  }

  async getEntityAndCountryHierarchyByCode(projectCode) {
    // Disabling all this for now until the orgUnit hierarchy is fixed
    // const project = await Project.findOne({ code: projectCode });
    // const projectEntity = project ? await Entity.findOne({ id: project.entity_id }) : undefined;
    // const hierarchy = await EntityHierarchy.findOne({ name: projectCode });
    const project = undefined;
    const projectEntity = undefined;
    const hierarchy = undefined;

    const world = await Entity.findOne({ code: WORLD });
    const country = await this.entity.countryEntity();

    const countryDescendants = hierarchy
      ? await country.getDescendants(hierarchy.id)
      : await country.getOrgUnitDescendants();

    const orgUnitHierarchy = projectEntity
      ? await this.filterForAccess([world, projectEntity, country, ...countryDescendants])
      : await this.filterForAccess([world, country, ...countryDescendants]);

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
    // Disabling all this for now until the project hierarchy is fixed
    // const project = await Project.findOne({ code: projectCode });
    // const hierarchy = await EntityHierarchy.findOne({ name: projectCode });
    const project = undefined;
    const hierarchy = undefined;

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
