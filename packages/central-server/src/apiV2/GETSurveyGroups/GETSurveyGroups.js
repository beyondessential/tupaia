import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertSurveyGroupsPermissions,
  createSurveyGroupDBFilter,
} from './assertSurveyGroupsPermissions';
/**
 * Handles endpoints:
 * - /surveyGroups
 * - /surveyGroups/:surveyGroupId
 */
export class GETSurveyGroups extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(surveyGroupId, options) {
    const surveyGroup = await super.findSingleRecord(surveyGroupId, options);

    const surveyGroupChecker = accessPolicy =>
      assertSurveyGroupsPermissions(accessPolicy, this.models, surveyGroupId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyGroupChecker]));

    return surveyGroup;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createSurveyGroupDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
