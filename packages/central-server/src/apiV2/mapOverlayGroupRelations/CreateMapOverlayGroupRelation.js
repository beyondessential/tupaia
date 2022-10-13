/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ObjectValidator } from '@tupaia/utils';
import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertMapOverlaysEditPermissions } from '../mapOverlays';
import { assertMapOverlayGroupsEditPermissions } from '../mapOverlayGroups';
import { getChildType } from './getChildType';
import { constructNewRecordValidationRules } from '../utilities';

/**
 * Handles POST endpoints:
 * - /mapOverlayGroupRelations
 */

export class CreateMapOverlayGroupRelation extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create a map overlay group relation',
      ),
    );
  }

  async createRecord() {
    // Check Permissions
    const mapOverlayGroupRelationChecker = async accessPolicy => {
      if (
        this.newRecordData.child_type ===
        this.models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY
      ) {
        return assertMapOverlaysEditPermissions(
          accessPolicy,
          this.models,
          this.newRecordData.child_id,
        );
      }

      return assertMapOverlayGroupsEditPermissions(
        accessPolicy,
        this.models,
        this.newRecordData.child_id,
      );
    };
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupRelationChecker]),
    );

    return this.insertRecord();
  }

  async validateNewRecord() {
    // Validate that the record matches required format
    const dataToValidate =
      this.parentRecordType !== '' && this.parentRecordId
        ? { [`${this.parentRecordType}_id`]: this.parentRecordId, ...this.newRecordData }
        : this.newRecordData;

    if (!dataToValidate.child_type) {
      const childType = await getChildType(this.models, dataToValidate.child_id);
      dataToValidate.child_type = childType;
    }

    const validator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, this.recordType, this.parentRecordType),
    );

    return validator.validate(dataToValidate); // Will throw an error if not valid
  }
}
