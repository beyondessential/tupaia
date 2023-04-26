/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class EditProject extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess]));
  }

  async editRecord() {
    const { countries, ...updatedFields } = this.updatedFields;

    if (!countries) {
      return super.updateRecord();
    }

    return this.models.wrapInTransaction(async transactingModels => {
      await this.createProjectEntityRelations(transactingModels, this.recordId, countries);

      if (Object.keys(updatedFields).length > 0) {
        await this.models.project.updateById(this.recordId, updatedFields);
      }

      return { id: this.recordId };
    });
  }

  async createProjectEntityRelations(models, projectId, countries) {
    const {
      entity_id: projectEntityId,
      entity_hierarchy_id: projectEntityHierarchyId,
    } = await models.project.findById(projectId);

    // get a list of the existing relations
    const existingRelations = await models.entityRelation.find(
      {
        'entity_relation.parent_id': projectEntityId,
        'entity_relation.entity_hierarchy_id': projectEntityHierarchyId,
        'child.type': 'country',
      },
      {
        multiJoin: [
          {
            joinWith: 'entity',
            joinAs: 'child',
            joinCondition: ['child.id', 'entity_relation.child_id'],
          },
        ],
      },
    );

    const existingRelationIds = existingRelations.map(x => x.id);
    const savedRelationIds = [];

    for (const countryId of countries) {
      const { code: countryCode } = await models.country.findOne({
        id: countryId,
      });
      const { id: entityId } = await models.entity.findOne({
        code: countryCode,
        type: 'country',
      });
      const savedRelation = await models.entityRelation.findOrCreate({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: projectEntityHierarchyId,
      });

      savedRelationIds.push(savedRelation.id);
    }

    const differences = existingRelationIds.filter(x => !savedRelationIds.includes(x));

    if (differences.length > 0) {
      for (const recordId of differences) {
        await models.entityRelation.deleteById(recordId);
      }
    }
  }
}
