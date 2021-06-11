/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { sleep } from '@tupaia/utils';

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_COOLDOWN_TIME = 1000; // wait a second between batches to give side effects time to finish processing
const CREATE = 'create';
const UPDATE = 'update';
const DELETE = 'delete';

const getColumnKey = (sheetName, columnHeader) => `${sheetName}/${columnHeader}`;

/**
 * This class will hold on to all of the creates, updates, and deletes that a survey response import
 * process wants to make, and allow running them all in batches once the whole spreadsheet is parsed
 *
 * The idea is that we can separate out the actual database updates from the parsing, validation,
 * and formatting elements of the process. Those earlier parts can then run and synchronously return
 * to the user with any validation errors.
 *
 * The db updates can then run in batches in the background, with "cooldown" periods between each
 * batch, so that the database doesn't get overwhelmed with too much activity in one hit (including
 * both the direct impact of the updates here, and the async side effects triggered by database
 * records changing).
 */
export class SurveyResponseUpdateBatcher {
  constructor(models) {
    this.models = models;
    // maintain a map of column keys to update details, where update details looks like
    // { sheetName, columnHeader, type, newSurveyResponse, newDataTime, answersToUpsert, answersToDelete }
    // n.b. all but columnHeader and type are optional
    this.updatesByColumnKey = {};
  }

  setupColumnsForSheet(sheetName, columnHeaders) {
    columnHeaders.forEach(columnHeader => {
      this.updatesByColumnKey[getColumnKey(sheetName, columnHeader)] = {
        type: UPDATE,
        sheetName,
        columnHeader,
        newSurveyResponse: null, // only populated if a new survey response is to be created
        newDataTime: null, // only populated if submission time is to be updated
        answers: {
          upserts: [], // populated for new or updated survey responses
          deletes: [], // populated for existing survey responses if answers are to be deleted
        },
      };
    });
  }

  createSurveyResponse(sheetName, columnHeader, newSurveyResponse) {
    const columnKey = getColumnKey(sheetName, columnHeader);
    this.updatesByColumnKey[columnKey].type = CREATE;
    this.updatesByColumnKey[columnKey].newSurveyResponse = newSurveyResponse;
  }

  deleteSurveyResponse(sheetName, columnHeader) {
    const columnKey = getColumnKey(sheetName, columnHeader);
    this.updatesByColumnKey[columnKey].type = DELETE;
  }

  updateDataTime(sheetName, columnHeader, newDataTime) {
    const columnKey = getColumnKey(sheetName, columnHeader);
    this.updatesByColumnKey[columnKey].newDataTime = newDataTime;
  }

  upsertAnswer(sheetName, columnHeader, details) {
    const columnKey = getColumnKey(sheetName, columnHeader);
    this.updatesByColumnKey[columnKey].answers.upserts.push(details);
  }

  deleteAnswer(sheetName, columnHeader, details) {
    const columnKey = getColumnKey(sheetName, columnHeader);
    this.updatesByColumnKey[columnKey].answers.deletes.push(details);
  }

  async processCreateSurveyResponse(transactingModels, { newSurveyResponse, answers }) {
    const { id: surveyResponseId } = await transactingModels.surveyResponse.create(
      newSurveyResponse,
    );
    await this.processUpsertAnswers(transactingModels, surveyResponseId, answers.upserts);
  }

  async processUpdateSurveyResponse(
    transactingModels,
    { columnHeader: surveyResponseId, newDataTime, answers },
  ) {
    if (newDataTime) {
      await transactingModels.surveyResponse.updateById(surveyResponseId, {
        data_time: newDataTime,
      });
    }
    await this.processUpsertAnswers(transactingModels, surveyResponseId, answers.upserts);
    await this.processDeleteAnswers(transactingModels, surveyResponseId, answers.deletes);
  }

  async processDeleteSurveyResponse(transactingModels, { columnHeader: surveyResponseId }) {
    await transactingModels.surveyResponse.deleteById(surveyResponseId);
  }

  async processUpsertAnswers(transactingModels, surveyResponseId, answers) {
    await Promise.all(
      answers.map(({ questionId, text, type }) =>
        transactingModels.answer.updateOrCreate(
          { survey_response_id: surveyResponseId, question_id: questionId },
          { text, type },
        ),
      ),
    );
  }

  async processDeleteAnswers(transactingModels, surveyResponseId, answers) {
    await Promise.all(
      answers.map(({ questionId }) =>
        transactingModels.answer.delete({
          survey_response_id: surveyResponseId,
          question_id: questionId,
        }),
      ),
    );
  }

  async processInBatches(batchSize = DEFAULT_BATCH_SIZE, cooldownTime = DEFAULT_COOLDOWN_TIME) {
    const batches = [];
    const columnKeys = Object.keys(this.updatesByColumnKey);
    for (let i = 0; i < columnKeys.length; i += batchSize) {
      batches.push(columnKeys.slice(i, i + batchSize));
    }

    const failures = [];
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batchOfUpdates = batches[batchIndex];
      for (const columnKey of batchOfUpdates) {
        const { type, ...details } = this.updatesByColumnKey[columnKey];
        try {
          // wrap each survey response in a transaction so that if any update to an individual
          // answer etc. fails, the whole survey response is rolled back and marked as a failure
          await this.models.wrapInTransaction(async transactingModels => {
            switch (type) {
              case CREATE:
                await this.processCreateSurveyResponse(transactingModels, details);
                break;
              case UPDATE:
                await this.processUpdateSurveyResponse(transactingModels, details);
                break;
              case DELETE:
                await this.processDeleteSurveyResponse(transactingModels, details);
                break;
              default:
                throw new Error('Missing or misconfigured update type');
            }
          });
        } catch (error) {
          const { sheetName, columnHeader } = details;
          failures.push({ sheetName, columnHeader, error: error.message });
        }
      }

      // wait some time between batches to give side effects time to finish processing
      await sleep(cooldownTime);
    }
    return { failures };
  }
}
