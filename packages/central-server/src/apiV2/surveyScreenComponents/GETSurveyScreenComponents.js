import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import {
  assertSurveyScreenComponentGetPermissions,
  createSurveyScreenComponentDBFilter,
} from './assertSurveyScreenComponentPermissions';

/**
 * Handles endpoints:
 * - /surveyScreenComponents
 * - /surveyScreenComponents/id
 * - /survey/id/surveyScreenComponents
 */

export class GETSurveyScreenComponents extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(surveyScreenComponentId, options) {
    const surveyScreenComponent = await super.findSingleRecord(surveyScreenComponentId, options);

    const surveyScreenComponentChecker = accessPolicy =>
      assertSurveyScreenComponentGetPermissions(accessPolicy, this.models, surveyScreenComponentId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyScreenComponentChecker]),
    );

    return surveyScreenComponent;
  }

  async getPermissionsFilter(criteria, options) {
    return createSurveyScreenComponentDBFilter(this.accessPolicy, this.models, criteria, options);
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Check parent permissions
    const surveyPermissionsChecker = async accessPolicy =>
      await this.models.survey.assertCanRead(accessPolicy, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyPermissionsChecker]),
    );

    return createSurveyScreenComponentDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
      this.parentRecordId,
    );
  }
}
