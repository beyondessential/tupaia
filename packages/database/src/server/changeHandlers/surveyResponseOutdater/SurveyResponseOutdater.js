import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';

import { getUniqueEntries, haveSameFields } from '@tupaia/utils';
import { ChangeHandler } from '../ChangeHandler';
import { isMarkedChange } from '../../../core/utilities';
import { OutdatedResponseFlagger } from './OutdatedResponseFlagger';

/**
 * Survey responses use an `outdated` flag to indicate whether their values should be used
 * for analytics building. This flag mainly depends on the survey response data time and on the
 * `period_granularity` of its parent survey.
 *
 * * For surveys with no `period_granularity`: no responses are outdated, or in
 * other words they all contribute towards analytics building
 *
 * * For  surveys with a `period_granularity` ("periodic"): only one response per
 * survey/entity/period combination will contribute towards analytics building;
 * the rest should be marked as outdated. This one response is selected on the basis of most
 * recent submission time
 *
 * Here, we refer to the survey/entity/period combo as "response dimension combo".
 * Example: Basic Clinic Survey/Tonga/July 2021
 *
 * @typedef { surveyId, entityId, startDate, endDate } ResponseDimensionCombo
 */

export class SurveyResponseOutdater extends ChangeHandler {
  debounceTime = 250;

  constructor(models) {
    super(models, 'survey-response-outdater');

    this.changeTranslators = {
      surveyResponse: change => this.translateSurveyResponseChange(change),
    };
  }

  /**
   * @private
   * Not all changed survey responses need to trigger an outdated status update
   * This method can be used to filter out changed records that are not worth
   * considering, without having to look into the DB for more information
   */
  translateSurveyResponseChange(changeDetails) {
    const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

    switch (type) {
      case 'update': {
        if (!oldRecord) {
          // A new response has been created which may outdate an existing response
          return [newRecord];
        }

        //If the new record is being changed to be outdated, no need to process it, as it already has the correct status
        if (newRecord.outdated && !oldRecord.outdated) {
          return [];
        }

        const records = [];
        const fieldsOfInterest = ['data_time', 'end_time', 'survey_id', 'entity_id', 'id'];
        if (!haveSameFields([newRecord, oldRecord], fieldsOfInterest)) {
          // Updated record may have moved in a new dimension combo and thus may outdate
          // an existing response
          records.push(newRecord);
          if (!oldRecord.outdated) {
            // Updated record was the most recent response in its previous dimension combo,
            // a new one may need to be selected
            records.push(oldRecord);
          }
        } else if (isMarkedChange(changeDetails)) {
          // Record was manually marked as changed, which may indicate that a client may want us to
          // re-calculate its `outdated` status. In this case the old record is identical to the
          // new, so no need to process it
          records.push(newRecord);
        }
        return records;
      }
      case 'delete':
        // If the deleted record was the most recent response in its dimension combo,
        // a new one must be selected
        return oldRecord.outdated ? [] : [oldRecord];
      default:
        throw new Error(`${type} is not a supported change type`);
    }
  }

  /**
   * @public
   * When survey responses change, their/other responses' `outdated` status may be stale.
   * This method processes the changed records and ensures that all responses in the affected
   * dimension combos get a correct `outdated` status
   */
  async handleChanges(transactingModels, changedResponses) {
    const surveysById = await this.fetchSurveysById(changedResponses);
    const responsesBySurveyId = groupBy(changedResponses, 'survey_id');
    const outdatedResponseFlagger = new OutdatedResponseFlagger(transactingModels);
    return Promise.all(
      Object.entries(responsesBySurveyId).map(([surveyId, responsesForSurvey]) =>
        outdatedResponseFlagger.flagOutdatedResponsesForSurvey(
          surveysById[surveyId],
          responsesForSurvey,
        ),
      ),
    );
  }

  /**
   * @private
   */
  async fetchSurveysById(surveyResponses) {
    const surveyIds = getUniqueEntries(surveyResponses.map(r => r.survey_id));
    const surveys = await this.models.survey.findManyById(surveyIds);
    return keyBy(surveys, 'id');
  }
}
