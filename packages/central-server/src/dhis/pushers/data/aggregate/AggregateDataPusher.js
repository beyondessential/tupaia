import moment from 'moment';
import { DHIS2_RESOURCE_TYPES, dhisToTupaiaPeriodType, combineDiagnostics } from '@tupaia/dhis-api';
import {
  DEFAULT_PERIOD_TYPE,
  periodToType,
  periodTypeToFormat,
  periodTypeToMomentUnit,
} from '@tupaia/tsutils';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { DataPusher } from '../DataPusher';
import { generateDataValue } from '../generateDataValue';

const { ORGANISATION_UNIT } = DHIS2_RESOURCE_TYPES;
const SUCCESS_DIAGNOSTICS = {
  wasSuccessful: true,
  counts: {},
  errors: [],
};

export class AggregateDataPusher extends DataPusher {
  constructor(...args) {
    super(...args);
    this.cache = {};
  }

  get isSurveyResponse() {
    return this.recordType === this.models.surveyResponse.databaseRecord;
  }

  async wrapFetchInCache(cacheKey, fetch) {
    if (this.cache[cacheKey] !== undefined) return this.cache[cacheKey];
    const response = await fetch();
    this.cache[cacheKey] = response;
    return response;
  }

  async fetchAnswer() {
    return this.wrapFetchInCache('answer', async () => {
      if (this.isSurveyResponse) return null;
      const answer = await this.models.answer.findById(this.recordId);
      if (!answer) throw new Error(`No answer found for ${this.recordId}`);
      return answer;
    });
  }

  async fetchSurveyResponseId() {
    return this.wrapFetchInCache('surveyResponseId', async () => {
      if (this.isSurveyResponse) return this.recordId;
      const answer = await this.fetchAnswer();
      return answer.survey_response_id;
    });
  }

  async fetchSurveyResponse() {
    return this.wrapFetchInCache('surveyResponse', async () => {
      const surveyResponseId = await this.fetchSurveyResponseId();
      const surveyResponse = await this.models.surveyResponse.findById(surveyResponseId);
      if (!surveyResponse) throw new Error(`No survey response found for ${this.recordId}`);
      return surveyResponse;
    });
  }

  async fetchSurvey() {
    return this.wrapFetchInCache('survey', async () => {
      // if this is a deletion, use the surveyId stored in the sync log record
      if (this.changeType === 'delete') {
        const { surveyId } = await this.fetchDataFromSyncLog();
        return this.models.survey.findById(surveyId);
      }
      const surveyResponse = await this.fetchSurveyResponse();
      return surveyResponse.survey();
    });
  }

  async fetchDataSet() {
    return this.wrapFetchInCache('dataSet', async () => {
      const survey = await this.fetchSurvey();
      if (!survey) throw new Error(`Could not retrieve survey for change ${this.recordId}`);
      return this.api.getDataSetByCode(survey.code);
    });
  }

  async fetchPeriodType() {
    const dataSet = await this.fetchDataSet();
    return dataSet ? dhisToTupaiaPeriodType(dataSet.periodType) : DEFAULT_PERIOD_TYPE;
  }

  async fetchPeriodBounds(period) {
    const getPeriodType = async () => {
      if (period) return periodToType(period);
      return this.fetchPeriodType();
    };
    const periodType = await getPeriodType();
    const getDataTime = async () => {
      if (period) return moment(period, periodTypeToFormat(periodType));
      const surveyResponse = await this.fetchSurveyResponse();
      return surveyResponse.dataTime();
    };
    const momentUnit = periodTypeToMomentUnit(periodType);
    const dataTime = await getDataTime();
    const minimumTime = stripTimezoneFromDate(dataTime.clone().startOf(momentUnit).format());
    const maximumTime = stripTimezoneFromDate(dataTime.clone().endOf(momentUnit).format());
    return [minimumTime, maximumTime];
  }

  async fetchOrganisationUnit() {
    return this.wrapFetchInCache('organisationUnit', async () => {
      if (this.changeType === 'delete') {
        const { orgUnit } = await this.fetchDataFromSyncLog();
        return this.models.entity.findOne({ code: orgUnit });
      }
      const surveyResponse = await this.fetchSurveyResponse();
      return surveyResponse.fetchOrganisationUnit();
    });
  }

  async fetchStoredBy() {
    return this.wrapFetchInCache('storedBy', async () => {
      const surveyResponse = await this.fetchSurveyResponse();
      const user = await surveyResponse.user();
      return user.fullName;
    });
  }

  async calculatePeriod() {
    return this.wrapFetchInCache('period', async () => {
      if (this.changeType === 'delete') {
        const { period } = await this.fetchDataFromSyncLog();
        return period;
      }

      // use a custom period type if defined by a data set matching the survey's code
      const periodType = await this.fetchPeriodType();
      const periodTypeFormat = periodTypeToFormat(periodType);
      if (!periodTypeFormat) throw new Error(`${periodType} is not a supported period type`);

      // interpret the submission time using the time zone of the survey response
      const surveyResponse = await this.fetchSurveyResponse();
      const period = surveyResponse.dataTime().format(periodTypeFormat);

      return period;
    });
  }

  /**
   * @returns {Promise<PushResults>}
   */
  async createOrUpdate() {
    const { dataValue, extraDataToLog } = await this.buildData();
    const dataToLog = { ...dataValue, ...extraDataToLog };

    // if org unit or period has changed from a prior sync, delete the old copy from dhis2
    const deleteDiagnostics = await this.deletePriorSyncIfSignificantChange(dataValue);

    // check whether this update is redundant, i.e. there is a matching record later in the same day/week/month/year
    const matchingRecord = await this.findMoreRecentResponse();
    if (matchingRecord) {
      const syncLogMessage = `Did not push ${this.recordId} to DHIS2 as there is a matching ${matchingRecord.databaseRecord} later in the same period (id: ${matchingRecord.id})`;
      // mark this sync as successful so it is cleared from the queue
      return { ...SUCCESS_DIAGNOSTICS, errors: [syncLogMessage], dataToLog };
    }

    // if this is a survey response, sync across a data set completion
    const dataSetCompletionDiagnostics = await this.pushDataSetCompletionIfRequired();

    // sync the data across to DHIS2
    const { diagnostics: updateDiagnostics, serverName } = await this.pushDataValue(dataValue);

    // combine the diagnostics
    const diagnostics = combineDiagnostics(
      updateDiagnostics,
      deleteDiagnostics,
      dataSetCompletionDiagnostics,
    );
    return {
      ...diagnostics,
      data: {
        ...dataToLog,
        serverName,
      },
    };
  }

  /**
   * Will delete any redundant information from dhis2 if the org unit or period has changed
   */
  async deletePriorSyncIfSignificantChange({ orgUnit, period }) {
    const syncLogRecord = await this.fetchSyncLogRecord();
    if (!this.checkExistsOnDhis2(syncLogRecord)) {
      // if it doesn't exist on DHIS, don't worry about attempting to delete
      return SUCCESS_DIAGNOSTICS;
    }
    const originalData = this.extractDataFromSyncLog(syncLogRecord);
    const orgUnitHasChanged = this.changeType === 'update' && originalData.orgUnit !== orgUnit;
    const periodHasChanged = this.changeType === 'update' && originalData.period !== period;
    return orgUnitHasChanged || periodHasChanged ? this.delete() : SUCCESS_DIAGNOSTICS;
  }

  async buildBaseDataSetCompletion(dataBeingDeleted) {
    const dataSet = await this.fetchDataSet();
    if (!dataSet) return null; // no matching data set, no need for completion push

    // get the period
    const period = dataBeingDeleted ? dataBeingDeleted.period : await this.calculatePeriod();

    // get the dhis2 organisation unit id
    const organisationUnitCode = dataBeingDeleted
      ? dataBeingDeleted.orgUnit
      : (await this.fetchOrganisationUnit()).code;
    const orgUnitId = await this.api.getIdFromCode(ORGANISATION_UNIT, organisationUnitCode);

    return {
      period,
      organisationUnit: orgUnitId,
      dataSet: dataSet.id,
    };
  }

  async pushDataValue(dataValue) {
    const { code } = dataValue;
    return this.dataBroker.push({ type: this.dataSourceTypes.DATA_ELEMENT, code }, dataValue);
  }

  async deleteDataValue(dataValue, serverName) {
    const { code } = dataValue;
    return this.dataBroker.delete({ code, type: this.dataSourceTypes.DATA_ELEMENT }, dataValue, {
      serverName,
    });
  }

  async pushDataSetCompletionIfRequired() {
    if (!this.isSurveyResponse) return SUCCESS_DIAGNOSTICS;
    const baseDataSetCompletion = await this.buildBaseDataSetCompletion();
    if (!baseDataSetCompletion) return SUCCESS_DIAGNOSTICS;

    // get the date the survey was completed
    const surveyResponse = await this.fetchSurveyResponse();
    const completionDate = surveyResponse.timezoneAwareEndTime().format('YYYY-MM-DDTHH:mm:ss');

    // get the submitting user's name
    const storedBy = await this.fetchStoredBy();

    // submit the data set completion
    return this.api.postDataSetCompletion({
      ...baseDataSetCompletion,
      date: completionDate,
      storedBy,
    });
  }

  async deleteDataSetCompletionIfRequired(dataBeingDeleted) {
    if (!this.isSurveyResponse) return SUCCESS_DIAGNOSTICS;
    const baseDataSetCompletion = await this.buildBaseDataSetCompletion(dataBeingDeleted);
    if (!baseDataSetCompletion) return SUCCESS_DIAGNOSTICS;
    return this.api.deleteDataSetCompletion(baseDataSetCompletion);
  }

  async buildData() {
    const answer = await this.fetchAnswer();
    const surveyResponse = await this.fetchSurveyResponse();
    const survey = await this.fetchSurvey();
    const baseDataValue = this.isSurveyResponse
      ? {
          code: `${survey.code}SurveyDate`,
          value: stripTimezoneFromDate(surveyResponse.dataTime().format()),
        }
      : await generateDataValue(this.models, answer);

    // Create an object containing information that is important to log after the record has synced,
    // as it will be used for processing any delete that occurs in future
    const extraDataToLog = {
      entityId: surveyResponse.entity_id,
      surveyId: surveyResponse.survey_id,
      questionId: answer ? answer.question_id : null,
      serverName: this.api.getServerName(),
    };
    const organisationUnit = await this.fetchOrganisationUnit();
    const period = await this.calculatePeriod();
    const storedBy = await this.fetchStoredBy();
    const dataValue = {
      ...baseDataValue,
      orgUnit: organisationUnit.code,
      period,
      storedBy,
    };
    return {
      dataValue,
      extraDataToLog, // Not required for the data sent to DHIS2, but helpful internally
    };
  }

  /**
   * If there is an answer/survey response for the same question/survey, during the same period, but
   * submitted at a later time, this one is redundant and should not sync. This is important because
   * if it does sync, it may overwrite the more up-to-date response that already synced to DHIS2
   */
  async findMoreRecentResponse() {
    const surveyResponse = await this.fetchSurveyResponse();
    const periodBounds = await this.fetchPeriodBounds();
    const laterSamePeriodSurveyResponses = await this.models.surveyResponse.find(
      {
        id: {
          comparator: '!=',
          comparisonValue: surveyResponse.id,
        },
        outdated: false,
        survey_id: surveyResponse.survey_id,
        entity_id: surveyResponse.entity_id,
        data_time: {
          comparisonType: 'whereBetween',
          args: [periodBounds],
        },
        end_time: {
          comparator: '>',
          comparisonValue: surveyResponse.end_time,
        },
      },
      {
        sort: ['data_time DESC'],
      },
    );
    if (laterSamePeriodSurveyResponses.length === 0) return null;
    if (this.recordType === this.models.surveyResponse.databaseRecord) {
      // This is a survey response, and there was a matching response later on the same day, so this
      // update is redundant and should not sync. Send the first (latest) survey response.
      return laterSamePeriodSurveyResponses[0];
    }
    // This is an answer, check whether any of the later survey responses have the same answer
    const { question_id: questionId } = await this.models.answer.findById(this.recordId);
    for (let i = 0; i < laterSamePeriodSurveyResponses.length; i++) {
      const matchingAnswer = await this.models.answer.findOne({
        survey_response_id: laterSamePeriodSurveyResponses[i].id,
        question_id: questionId,
      });
      if (matchingAnswer) {
        // There is an answer to the same question later on the same day, so this update is redundant
        return matchingAnswer;
      }
    }
    // Despite there being later survey response(s) on the same day, the question this answer relates
    // to was not answered in any of them, so this update is not redundant and should sync
    return null;
  }

  /**
   * @returns {Promise<PushResults>}
   */
  async delete() {
    const syncLogRecord = await this.fetchSyncLogRecord();
    if (!this.checkExistsOnDhis2(syncLogRecord)) {
      // if it doesn't exist on DHIS, don't worry about attempting to delete
      return { wasSuccessful: true };
    }

    const syncLogData = this.extractDataFromSyncLog(syncLogRecord);
    const { orgUnit, code, period, serverName } = syncLogData;
    const dataToDelete = { orgUnit, code, period };
    const deleteDiagnostics = await this.deleteDataValue(dataToDelete, serverName);

    // delete data set completion if required
    const dataSetCompletionDiagnostics = await this.deleteDataSetCompletionIfRequired(dataToDelete);

    // Set up any duplicate information to resync, so that it is not lost from DHIS2
    await this.addMatchingRecordsToSyncQueue(syncLogData);

    return combineDiagnostics(deleteDiagnostics, dataSetCompletionDiagnostics);
  }

  /**
   * Resyncs any records that contain data for the same orgUnit, dataElement, and period as
   * syncLogData so that after a duplicate is deleted, any relevant older data is on DHIS2
   */
  async addMatchingRecordsToSyncQueue(syncLogData) {
    const { orgUnit, period, questionId, surveyId } = syncLogData;
    const entityId =
      syncLogData.entityId || (await this.models.entity.findOne({ code: orgUnit })).id;
    const periodBounds = await this.fetchPeriodBounds(period);
    const duplicateSurveyResponseCriteria = {
      survey_id: surveyId,
      entity_id: entityId,
      data_time: {
        comparisonType: 'whereBetween',
        args: [periodBounds],
      },
      outdated: false,
    };
    switch (this.recordType) {
      case this.models.surveyResponse.databaseRecord: {
        // Add matching survey responses to sync queue
        const survey = await this.models.survey.findById(surveyId);
        // We need to resync any survey response for a survey with *the same survey code* as there is
        // only a single data element recording survey response dates on DHIS2 for each survey code
        const matchingSurveys = await this.models.survey.find({ code: survey.code });
        for (let i = 0; i < matchingSurveys.length; i++) {
          await this.models.surveyResponse.markAsChanged({
            ...duplicateSurveyResponseCriteria,
            survey_id: matchingSurveys[i].id,
          });
        }
        break;
      }
      default:
      case this.models.answer.databaseRecord: {
        // Add matching answers to sync queue
        const matchingSurveyResponses = await this.models.surveyResponse.find(
          duplicateSurveyResponseCriteria,
        );
        for (let i = 0; i < matchingSurveyResponses.length; i++) {
          await this.models.answer.markAsChanged({
            survey_response_id: matchingSurveyResponses[i].id,
            question_id: questionId,
          });
        }
      }
    }
  }
}
