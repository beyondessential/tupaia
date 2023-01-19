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
    const updatedFieldsIncludeCanonicalTypes = Object.keys(this.updatedFields).includes(
      canonicalTypesField,
    );

    if (updatedFieldsIncludeCanonicalTypes) {
      const { entity_hierarchy_id: hierarchyId } = await this.models.project.findOne({
        id: this.recordId,
      });

      await this.models.entityHierarchy.updateById(hierarchyId, {
        canonical_types: this.updatedFields['entity_hierarchy.canonical_types'],
      });
    }

    const updatedFieldsWithoutCanonicalTypes = { ...this.updatedFields };
    delete updatedFieldsWithoutCanonicalTypes['entity_hierarchy.canonical_types'];

    const projectFieldsNeedToBeUpdated = Object.keys(updatedFieldsWithoutCanonicalTypes).length > 0;

    if (projectFieldsNeedToBeUpdated) {
      await this.models
        .getModelForDatabaseType(this.recordType)
        .updateById(this.recordId, this.updatedFields);
    }
  }
}
