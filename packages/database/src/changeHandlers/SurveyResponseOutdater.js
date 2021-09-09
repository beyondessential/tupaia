/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import assert from 'assert';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';
import moment from 'moment';

import { getUniqueEntries, getUniqueObjects, haveSameFields, max, min } from '@tupaia/utils';
import { ChangeHandler } from './ChangeHandler';
import { PERIOD_GRANULARITIES, PERIOD_GRANULARITY_TO_MOMENT_UNIT } from '../modelClasses/Survey';
import { isMarkedChange } from '../utilities';

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

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = `${DATE_FORMAT} HH:mm:ss`;

const MAX_DEBUGGING_INFO_ITEMS = 1000;

/**
 * Cache of period ranges keyed by requested period granularity first, then date
 *
 * ```js
 * {
 *   yearly: {
 *     "2021-05-05": { startDate: '2021-01-01', endDate: '2021-12-31' }
 *   }
 *   monthly: {
 *     "2021-07-06": { startDate: '2021-07-01', endDate: '2021-07-31' }
 *   }
 * }
 * ```
 */
const periodRangeCache = Object.fromEntries(
  Object.values(PERIOD_GRANULARITIES).map(granularity => [granularity, {}]),
);

/**
 * @param {Date|string} datetime
 * @returns {string}
 */
const extractDateString = datetime => {
  const datetimeString = typeof datetime === 'string' ? datetime : datetime.toISOString();
  return datetimeString.substring(0, DATE_FORMAT.length);
};

/**
 */
const getPeriodRange = (periodGranularity, datetime) => {
  // None of the existing granularities depends on time, so we can just use the date part
  // to cache/retrieve date ranges
  const date = extractDateString(datetime);
  const existingRange = periodRangeCache?.[periodGranularity]?.[date];
  if (existingRange) {
    return existingRange;
  }

  const momentUnit = PERIOD_GRANULARITY_TO_MOMENT_UNIT[periodGranularity];
  const range = {
    startDate: moment(datetime).startOf(momentUnit).format(DATETIME_FORMAT),
    endDate: moment(datetime).endOf(momentUnit).format(DATETIME_FORMAT),
  };
  periodRangeCache[periodGranularity][date] = range;

  return range;
};

const getIdOfMostRecentResponse = surveyResponses => {
  assert.notStrictEqual(surveyResponses.length, 0);

  const comparableResponses = surveyResponses.map(response => ({
    ...response,
    // If other ordering criteria are the same, not outdated responses take precedence over outdated
    // Assign numeric value for comparison
    notOutdated: response.outdated ? 0 : 1,
  }));

  return orderBy(
    comparableResponses,
    ['end_time', 'notOutdated', 'id'],
    ['desc', 'desc', 'desc'],
  )[0].id;
};

const getDimensionCombo = (surveyResponse, survey) => {
  const { period_granularity: periodGranularity } = survey;
  const { data_time: dataTime } = surveyResponse;
  const { startDate, endDate } = getPeriodRange(periodGranularity, dataTime);

  return {
    surveyId: survey.id,
    entityId: surveyResponse.entity_id,
    startDate,
    endDate,
  };
};

const groupResponsesForSurveyByDimensionCombo = (surveyResponses, survey) =>
  Object.values(groupBy(surveyResponses, sr => JSON.stringify(getDimensionCombo(sr, survey))));

/**
 * Not all changed survey responses need to trigger an outdated status update
 * This method can be used to filter out changed records that are not worth
 * considering, without having to look into the DB for more information
 */
const translateSurveyResponseChanges = changeDetails => {
  const { type, new_record: newRecord, old_record: oldRecord } = changeDetails;

  switch (type) {
    case 'update': {
      if (!oldRecord) {
        // A new response has been created which may outdate an existing response
        return [newRecord];
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
};

export class SurveyResponseOutdater extends ChangeHandler {
  debounceTime = 250;

  constructor(models) {
    super(models);

    this.changeTranslators = {
      surveyResponse: translateSurveyResponseChanges,
    };
  }

  /**
   * When survey responses change, their/other responses' `outdated` status may be stale.
   * This method processes the changed records and ensures that all responses in the affected
   * dimension combos get a correct `outdated` status
   */
  handleChanges = async changedResponses => {
    const surveysById = await this.fetchSurveysById(changedResponses);
    const responsesBySurveyId = groupBy(changedResponses, 'survey_id');

    return Promise.all(
      Object.entries(responsesBySurveyId).map(([surveyId, responses]) =>
        this.handleResponsesForSurvey(responses, surveysById[surveyId]),
      ),
    );
  };

  getChangeDebuggingInfo = changedResponses =>
    changedResponses.length > MAX_DEBUGGING_INFO_ITEMS
      ? `Could not outdate ${changedResponses.length} survey responses`
      : `Could not outdate survey responses with ids ${changedResponses.map(sr => sr.id)}`;

  handleResponsesForSurvey = async (changedResponses, survey) => {
    if (!survey?.['period_granularity']) {
      // Survey responses for non periodic surveys are always "not outdated"
      const updateIds = changedResponses.filter(sr => sr.outdated).map(sr => sr.id);
      await this.setOutdatedStatus(updateIds, false);
      return;
    }

    const combos = getUniqueObjects(changedResponses.map(sr => getDimensionCombo(sr, survey)));
    const surveyResponses = await this.findResponsesAcrossDimensionCombos(combos);
    const responsesGroupedByCombo = groupResponsesForSurveyByDimensionCombo(
      surveyResponses,
      survey,
    );

    const idsByNewStatus = this.getResponseIdsForOutdatedStatusUpdate(responsesGroupedByCombo);
    await this.setOutdatedStatus(idsByNewStatus.true, true);
    await this.setOutdatedStatus(idsByNewStatus.false, false);
  };

  /**
   * Returns a list of survey responses that should get their `outdated` status updated,
   * keyed by the new (correct) status.
   */
  getResponseIdsForOutdatedStatusUpdate = responsesGroupedByCombo => {
    const idsByNewStatus = {
      true: [],
      false: [],
    };

    responsesGroupedByCombo.forEach(responseGroup => {
      const idOfMostRecent = getIdOfMostRecentResponse(responseGroup);

      responseGroup.forEach(({ id, outdated: currentOutdated }) => {
        // Only one response (the most recent) per group should be "not outdated"
        const outdated = id !== idOfMostRecent;
        if (outdated !== currentOutdated) {
          // Only include records with changed status to avoid unnecessary updates
          idsByNewStatus[outdated].push(id);
        }
      });
    });

    return idsByNewStatus;
  };

  fetchSurveysById = async surveyResponses => {
    const surveyIds = getUniqueEntries(surveyResponses.map(r => r.survey_id));
    const surveys = await this.models.survey.findManyById(surveyIds);
    return keyBy(surveys, 'id');
  };

  findResponsesAcrossDimensionCombos = async combos => {
    const surveyIds = getUniqueEntries(combos.map(c => c.surveyId));
    const entityIds = getUniqueEntries(combos.map(c => c.entityId));
    const minStartDate = min(combos.map(c => c.startDate));
    const maxEndDate = max(combos.map(c => c.endDate));

    return this.models.surveyResponse.find({
      survey_id: surveyIds,
      entity_id: entityIds,
      data_time: {
        comparator: 'between',
        comparisonValue: [minStartDate, maxEndDate],
      },
    });
  };

  findMostRecentResponse = async where =>
    this.models.surveyResponse.findOne(where, { sort: ['end_time DESC'], limit: 1 });

  setOutdatedStatus = async (responseIds, outdated) =>
    this.models.surveyResponse.update({ id: getUniqueEntries(responseIds) }, { outdated });
}
