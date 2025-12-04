import { hasBESAdminAccess } from '@tupaia/access-policy';
import { SyncDirections } from '@tupaia/constants';

import { MaterializedViewLogDatabaseModel } from '../../analytics';
import { QUERY_CONJUNCTIONS } from '../../BaseDatabase';
import { DatabaseRecord } from '../../DatabaseRecord';
import { RECORDS } from '../../records';
import { buildSyncLookupSelect } from '../../sync';
import { mergeMultiJoin } from '../../utilities/mergeMultiJoin';
import { constructAnswerValidator } from './constructAnswerValidator';

export class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  /**
   * @privateRemarks Used only by central-server. I think these are only relevant to MediTrak.
   * @see `@central-server/database/models/Answer`
   */
  static types = {
    ARITHMETIC: 'Arithmetic',
    AUTOCOMPLETE: 'Autocomplete',
    BINARY: 'Binary',
    CHECKBOX: 'Checkbox',
    CODE_GENERATOR: 'CodeGenerator',
    CONDITION: 'Condition',
    DATE: 'Date',
    DATE_OF_DATA: 'DateOfData',
    DATE_TIME: 'DateTime',
    DAYS_SINCE: 'DaysSince',
    ENTITY: 'Entity',
    FILE: 'File',
    FREE_TEXT: 'FreeText',
    GEOLOCATE: 'Geolocate',
    INSTRUCTION: 'Instruction',
    MONTHS_SINCE: 'MonthsSince',
    NUMBER: 'Number',
    PHOTO: 'Photo',
    PRIMARY_ENTITY: 'PrimaryEntity',
    RADIO: 'Radio',
    SUBMISSION_DATE: 'SubmissionDate',
    TASK: 'Task',
    USER: 'User',
    YEARS_SINCE: 'YearsSince',
    // If adding a new type, add validation in both importSurveys and updateSurveyResponses
  };

  static constructAnswerValidator(models, question) {
    return constructAnswerValidator(models, question);
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
    const dbConditions = { ...criteria };
    const dbOptions = { ...options };

    if (hasBESAdminAccess(accessPolicy)) {
      return { dbConditions, dbOptions };
    }

    const countryCodesByPermissionGroupId =
      await this.otherModels.permissionGroup.fetchCountryCodesByPermissionGroupId(accessPolicy);

    // Join SQL table with survey_response, entity and survey tables
    // Running the permissions filtering is much faster with joins than records individually
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: RECORDS.SURVEY_RESPONSE,
          joinCondition: [`${RECORDS.SURVEY_RESPONSE}.id`, `${RECORDS.ANSWER}.survey_response_id`],
        },
        {
          joinWith: RECORDS.SURVEY,
          joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.SURVEY_RESPONSE}.survey_id`],
        },
        {
          joinWith: RECORDS.ENTITY,
          joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.SURVEY_RESPONSE}.entity_id`],
        },
      ],
      dbOptions.multiJoin,
    );

    // Check the country code of the entity exists in our list for the permission group
    // of the survey
    dbConditions[QUERY_CONJUNCTIONS.RAW] = {
      sql: `
        entity.country_code IN (
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
        )
      `,
      parameters: JSON.stringify(countryCodesByPermissionGroupId),
    };

    return { dbConditions, dbOptions };
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `array_remove(ARRAY[survey.project_id], NULL)`,
      }),
      joins: `
        LEFT JOIN survey_response
          ON survey_response.id = answer.survey_response_id
          AND survey_response.outdated IS FALSE -- no outdated survey response
        LEFT JOIN survey ON survey.id = survey_response.survey_id
      `,
    };
  }

  get DatabaseRecordClass() {
    return AnswerRecord;
  }
}
