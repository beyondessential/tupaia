/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BESAdminEditHandler } from '../EditHandler';

export class EditProject extends BESAdminEditHandler {
  async editRecord() {
    await this.updateRecord();
  }

  async updateRecord() {
    const canonicalTypesField = 'entity_hierarchy.canonical_types';
    const canonicalTypesIncluded = Object.keys(this.updatedFields).includes(canonicalTypesField);

    await this.models.wrapInTransaction(async transactingModels => {
      if (canonicalTypesIncluded) {
        const { entity_hierarchy_id: hierarchyId } = await transactingModels.project.findOne({
          id: this.recordId,
        });

        await transactingModels.entityHierarchy.updateById(hierarchyId, {
          canonical_types: this.updatedFields['entity_hierarchy.canonical_types'],
        });
      }

      const updatedFieldsWithoutCanonicalTypes = { ...this.updatedFields };
      delete updatedFieldsWithoutCanonicalTypes['entity_hierarchy.canonical_types'];

      const projectFieldsNeedToBeUpdated =
        Object.keys(updatedFieldsWithoutCanonicalTypes).length > 0;

      if (projectFieldsNeedToBeUpdated) {
        await transactingModels
          .getModelForDatabaseType(this.recordType)
          .updateById(this.recordId, this.updatedFields);
      }
    });
  }
}
