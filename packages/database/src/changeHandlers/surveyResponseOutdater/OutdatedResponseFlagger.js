import assert from 'assert';
import groupBy from 'lodash.groupby';
import orderBy from 'lodash.orderby';

import {
  getDateRangeForGranularity,
  getUniqueEntries,
  getUniqueObjects,
  max,
  min,
} from '@tupaia/utils';

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
  const { startDate, endDate } = getDateRangeForGranularity(dataTime, periodGranularity);

  return {
    surveyId: survey.id,
    entityId: surveyResponse.entity_id,
    startDate,
    endDate,
  };
};

const groupResponsesForSurveyByDimensionCombo = (surveyResponses, survey) =>
  Object.values(groupBy(surveyResponses, sr => JSON.stringify(getDimensionCombo(sr, survey))));

export class OutdatedResponseFlagger {
  constructor(models) {
    this.models = models;
  }

  /**
   * @public
   * When survey responses change, their/other responses' `outdated` status may be stale.
   * This method processes the changed records and ensures that all responses in the affected
   * dimension combos get a correct `outdated` status
   */
  async flagOutdatedResponsesForSurvey(survey, changedResponses) {
    if (!survey?.period_granularity) {
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
  }

  /**
   * @private
   * Returns a list of survey responses that should get their `outdated` status updated,
   * keyed by the new (correct) status.
   */
  getResponseIdsForOutdatedStatusUpdate(responsesGroupedByCombo) {
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
  }

  /**
   * @private
   */
  async findResponsesAcrossDimensionCombos(combos) {
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
  }

  /**
   * @private
   */
  async setOutdatedStatus(responseIds, outdated) {
    return this.models.surveyResponse.update({ id: getUniqueEntries(responseIds) }, { outdated });
  }
}
