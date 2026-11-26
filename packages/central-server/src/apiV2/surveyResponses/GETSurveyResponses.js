import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { getQueryOptionsForColumns } from '../GETHandler/helpers';
import { assertEntityPermissions } from '../entities';

/**
 * Handles endpoints:
 * - /surveyResponses
 * - /surveyResponses/:surveyResponseId
 */
export class GETSurveyResponses extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  customJoinConditions = /** @type {const} */ ({
    country: {
      through: 'entity',
      nearTableKey: 'entity.country_code',
      farTableKey: 'country.code',
    },
    entity: {
      nearTableKey: 'survey_response.entity_id',
      farTableKey: 'entity.id',
    },
    survey: {
      nearTableKey: 'survey_response.survey_id',
      farTableKey: 'survey.id',
    },
  });

  async findSingleRecord(surveyResponseId, options) {
    const surveyResponseChecker = async accessPolicy =>
      await this.models.surveyResponse.assertCanRead(this.models, accessPolicy, surveyResponseId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );
    return await super.findSingleRecord(surveyResponseId, options);
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

  async findRecords(criteria, options) {
    // The base GETHandler builds joins from requested *columns* only, so any
    // join needed to satisfy a *criteria* key (e.g. survey.project_id added by
    // admin-panel-server's applyProjectScope middleware) must be merged in
    // here. For BES Admins, createRecordsPermissionFilter is a no-op and never
    // adds the survey/entity joins, so without this merge the SQL fails with
    // "missing FROM-clause entry for table survey".
    const criteriaColumns = Object.keys(criteria).filter(column => !column.startsWith('_'));
    const { multiJoin: criteriaJoins } = getQueryOptionsForColumns(
      criteriaColumns,
      this.recordType,
      this.customJoinConditions,
      this.defaultJoinType,
    );
    const existing = options?.multiJoin ?? [];
    const seen = new Set(existing.map(join => join.joinWith));
    const mergedJoins = [...existing];
    for (const join of criteriaJoins) {
      if (!seen.has(join.joinWith)) {
        mergedJoins.push(join);
        seen.add(join.joinWith);
      }
    }
    return super.findRecords(criteria, { ...options, multiJoin: mergedJoins });
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
