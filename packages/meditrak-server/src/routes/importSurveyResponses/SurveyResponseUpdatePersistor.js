/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const RESPONSES_PER_BULK_BATCH = 300; // number of survey responses processed per bulk insert/delete

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

function batch(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * This class will hold on to all of the creates, updates, and deletes that a survey response import
 * process wants to make, and allow running them all in batches once the whole spreadsheet is parsed
 *
 * The idea is that we can separate out the actual database updates from the parsing, validation,
 * and formatting elements of the process. Those earlier parts can then run and synchronously return
 * to the user with any validation errors. The db updates can then run in batches in the background.
 */
export class SurveyResponseUpdatePersistor {
  constructor(models) {
    this.models = models;
    // maintain a map of response ids to update details, where update details looks like
    // { sheetName, surveyResponseId, type, newSurveyResponse, newDataTime, answersToUpsert, answersToDelete }
    // n.b. all but sheetName, surveyResponseId, and type are optional
    this.updatesByResponseId = {};
  }

  count() {
    return Object.keys(this.updatesByResponseId).length;
  }

  setupColumnsForSheet(sheetName, surveyResponseIds) {
    surveyResponseIds.forEach((surveyResponseId, columnIndex) => {
      if (!surveyResponseId) return; // array contains some empty slots representing info columns
      this.updatesByResponseId[surveyResponseId] = {
        type: UPDATE,
        sheetName,
        columnIndex,
        surveyResponseId,
        newSurveyResponse: null, // only populated if a new survey response is to be created
        newDataTime: null, // only populated if submission time is to be updated
        answers: {
          upserts: [], // populated for new or updated survey responses
          deletes: [], // populated for existing survey responses if answers are to be deleted
        },
      };
    });
  }

  createSurveyResponse(surveyResponseId, newSurveyResponse) {
    this.updatesByResponseId[surveyResponseId].type = CREATE;
    this.updatesByResponseId[surveyResponseId].newSurveyResponse = newSurveyResponse;
  }

  deleteSurveyResponse(surveyResponseId) {
    this.updatesByResponseId[surveyResponseId].type = DELETE;
  }

  updateDataTime(surveyResponseId, newDataTime) {
    this.updatesByResponseId[surveyResponseId].newDataTime = newDataTime;
  }

  upsertAnswer(surveyResponseId, details) {
    this.updatesByResponseId[surveyResponseId].answers.upserts.push(details);
  }

  deleteAnswer(surveyResponseId, details) {
    this.updatesByResponseId[surveyResponseId].answers.deletes.push(details);
  }

  // ---- process creates in bulk, batching to avoid running out of memory ----

  async processCreates(creates) {
    const failures = [];
    for (const batchOfCreates of batch(creates, RESPONSES_PER_BULK_BATCH)) {
      try {
        await this.models.wrapInTransaction(async transactingModels => {
          const newSurveyResponses = creates.map(({ newSurveyResponse }) => newSurveyResponse);
          const newAnswers = batchOfCreates
            .map(({ answers }) =>
              answers.upserts.map(({ surveyResponseId, questionId, type, text }) => ({
                survey_response_id: surveyResponseId,
                question_id: questionId,
                type,
                text,
              })),
            )
            .flat();
          await transactingModels.surveyResponse.createMany(newSurveyResponses);
          await transactingModels.answer.createMany(newAnswers);
        });
      } catch (error) {
        failures.push(
          ...batchOfCreates.map(c => ({
            ...c,
            error: `Error creating survey responses in bulk: ${error.message}`,
          })),
        );
      }
    }
    return { failures };
  }

  // ---- process updates in serial, recording individual failures ----

  async processUpdates(updates) {
    const failures = [];
    for (const update of updates) {
      try {
        // wrap each survey response in a transaction so that if any update to an individual
        // answer etc. fails, the whole survey response is rolled back and marked as a failure
        await this.models.wrapInTransaction(async transactingModels =>
          this.processUpdate(transactingModels, update),
        );
      } catch (error) {
        failures.push({ ...update, error: error.message });
      }
    }
    return { failures };
  }

  async processUpdate(transactingModels, { surveyResponseId, newDataTime, answers }) {
    if (newDataTime) {
      await transactingModels.surveyResponse.updateById(surveyResponseId, {
        data_time: newDataTime,
      });
    }
    await this.processUpsertAnswers(transactingModels, surveyResponseId, answers.upserts);
    await this.processDeleteAnswers(transactingModels, surveyResponseId, answers.deletes);
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

  // ---- process deletes in bulk, batching to avoid running out of memory ----

  async processDeletes(deletes) {
    const failures = [];
    for (const batchOfDeletes of batch(deletes, RESPONSES_PER_BULK_BATCH)) {
      try {
        await this.models.wrapInTransaction(async transactingModels => {
          const surveyResponseIds = batchOfDeletes.map(({ surveyResponseId }) => surveyResponseId);
          await transactingModels.surveyResponse.delete({ id: surveyResponseIds });
        });
        return { failures: [] };
      } catch (error) {
        failures.push(
          ...batchOfDeletes.map(d => ({
            ...d,
            error: `Error deleting survey responses in bulk: ${error.message}`,
          })),
        );
      }
    }
    return { failures };
  }

  async process() {
    const allUpdates = Object.values(this.updatesByResponseId);
    const creates = allUpdates.filter(({ type }) => type === CREATE);
    const { failures: createFailures } = await this.processCreates(creates);

    const updates = allUpdates.filter(({ type }) => type === UPDATE);
    const { failures: updateFailures } = await this.processUpdates(updates);

    const deletes = allUpdates.filter(({ type }) => type === DELETE);
    const { failures: deleteFailures } = await this.processDeletes(deletes);

    return { failures: [...createFailures, ...updateFailures, ...deleteFailures] };
  }
}
