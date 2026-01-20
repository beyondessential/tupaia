import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { getQueryOptionsForColumns } from '../GETHandler/helpers';
import { assertEntityPermissions } from '../entities';
import { assertSurveyResponsePermissions } from './assertSurveyResponsePermissions';

/**
 * Handles endpoints:
 * - /surveyResponses
 * - /surveyResponses/:surveyResponseId
 */
export class GETSurveyResponses extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    country: {
      through: 'entity',
      nearTableKey: 'entity.country_code',
      farTableKey: 'country.code',
    },
    entity: {
      nearTableKey: 'survey_response.entity_id',
      farTableKey: 'entity.id',
    },
  };

  async findSingleRecord(surveyResponseId, options) {
    const surveyResponse = await super.findSingleRecord(surveyResponseId, options);

    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, surveyResponseId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );
    return surveyResponse;
  }

  async getPermissionsFilter(criteria, options) {
    return await this.models.surveyResponse.createRecordsPermissionFilter(
      this.accessPolicy,
      criteria,
      options,
    );
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const entityPermissionChecker = accessPolicy =>
      assertEntityPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityPermissionChecker]),
    );
    // Filter by parent
    const dbConditions = { 'survey_response.entity_id': this.parentRecordId, ...criteria };

    // Apply regular permissions
    return this.getPermissionsFilter(dbConditions, options);
  }

  async countRecords(criteria) {
    // remove conjunction criteria
    const columnsInCountQuery = Object.keys(criteria).filter(column => !column.startsWith('_'));

    // Always filter by survey permissions and entity permissions for non BES Admin users
    // See: surveyResponse.createRecordsPermissionFilter
    if (!hasBESAdminAccess(this.accessPolicy)) {
      columnsInCountQuery.push('entity.id', 'survey.id');
    }

    // Only join tables that we are filtering on
    const { multiJoin } = getQueryOptionsForColumns(
      columnsInCountQuery,
      this.recordType,
      this.customJoinConditions,
      this.defaultJoinType,
    );

    return this.database.countFast(this.recordType, criteria, { multiJoin });
  }
}
