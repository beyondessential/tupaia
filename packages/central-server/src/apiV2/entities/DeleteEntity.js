/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BESAdminDeleteHandler } from '../DeleteHandler';

const UNDELETEABLE_ENTITY_TYPES = ['project', 'country'];

export class DeleteEntity extends BESAdminDeleteHandler {
  async deleteRecord() {
    const entity = await this.resourceModel.findById(this.recordId);
    if (UNDELETEABLE_ENTITY_TYPES.includes(entity.type)) {
      throw new Error(`Cannot delete an entity of type: ${entity.type}`);
    }

    // Check for existing survey responses (they should be cleaned up first)
    const surveyResponsesForEntity = await this.models.surveyResponse.find({
      entity_id: entity.id,
    });
    if (surveyResponsesForEntity.length > 0) {
      throw new Error(
        `There are still survey responses for this entity, please clean them up before deleting this entity`,
      );
    }

    // Check for children (they should be given a new parent first)
    const hierarchies = await this.models.entityHierarchy.all();
    const hierarchiesWhereEntityHasChildren = [];
    for (let i = 0; i < hierarchies.length; i++) {
      const hierarchy = hierarchies[i];
      const children = await entity.getChildren(hierarchy.id);
      if (children.length > 0) {
        hierarchiesWhereEntityHasChildren.push(hierarchy);
      }
    }

    if (hierarchiesWhereEntityHasChildren.length > 0) {
      throw new Error(
        `This entity still has children in the following hierarchies [${hierarchiesWhereEntityHasChildren.map(
          hierarchy => hierarchy.name,
        )}], please delete them or re-import them with a new parent before deleting this entity`,
      );
    }

    // Delete any entity_relations where this entity is the leaf node, as they prevent deleting the entity otherwise
    await this.models.entityRelation.delete({ child_id: this.recordId });

    await super.deleteRecord();
  }
}
