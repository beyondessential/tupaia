import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertMapOverlaysEditPermissions } from '../mapOverlays';
import { assertMapOverlayGroupsEditPermissions } from '../mapOverlayGroups';

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
}
