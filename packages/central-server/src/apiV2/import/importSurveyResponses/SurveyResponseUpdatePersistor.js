/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const RECORDS_PER_BULK_BATCH = 5000; // number of records (survey responses + answers) processed per bulk insert/delete

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

function batchCreates(creates) {
  const batches = [];
  let currentBatchIndex = 0;
  let currentBatchRecordCount = 0;
  for (const create of creates) {
    const answerCount = create.answers.upserts.length;
    const recordCount = answerCount + 1; // +1 for the response itself
    if (currentBatchRecordCount + recordCount > RECORDS_PER_BULK_BATCH) {
      currentBatchIndex++;
      currentBatchRecordCount = 0;
    }
    if (!batches[currentBatchIndex]) {
      batches[currentBatchIndex] = [];
    }
    batches[currentBatchIndex].push(create);
    currentBatchRecordCount += recordCount;
  }
  return batches;
}

function batchDeletes(deletes) {
  const batches = [];
  for (let i = 0; i < deletes.length; i += RECORDS_PER_BULK_BATCH) {
    batches.push(deletes.slice(i, i + RECORDS_PER_BULK_BATCH));
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

  setupColumnsForSheet(sheetName, surveyResponses) {
    surveyResponses.forEach((surveyResponse, columnIndex) => {
      if (!surveyResponse) return; // array contains some empty slots representing info columns
      this.updatesByResponseId[surveyResponse.surveyResponseId] = {
        type: UPDATE,
        sheetName,
        columnIndex,
        surveyResponseId: surveyResponse.surveyResponseId,
        entityId: surveyResponse.entityId,
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
    for (const batchOfCreates of batchCreates(creates)) {
      try {
        await this.models.wrapInTransaction(async transactingModels => {
          const newSurveyResponses = batchOfCreates.map(
            ({ newSurveyResponse }) => newSurveyResponse,
          );
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
        const batchOfFailures = batchOfCreates.map(c => ({
          ...c,
          error: `Error creating survey responses in bulk: ${error.message}`,
        }));
        failures.push(...batchOfFailures);
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

  async processUpdate(transactingModels, { surveyResponseId, entityId, newDataTime, answers }) {
    const newData = { entity_id: entityId };
    if (newDataTime) {
      newData.data_time = newDataTime;
    }
    await transactingModels.surveyResponse.updateById(surveyResponseId, newData);
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
    for (const batchOfDeletes of batchDeletes(deletes)) {
      try {
        await this.models.wrapInTransaction(async transactingModels => {
          const surveyResponseIds = batchOfDeletes.map(({ surveyResponseId }) => surveyResponseId);
          await transactingModels.surveyResponse.delete({ id: surveyResponseIds });
        });
      } catch (error) {
        const batchOfFailures = batchOfDeletes.map(d => ({
          ...d,
          error: `Error deleting survey responses in bulk: ${error.message}`,
        }));
        failures.push(...batchOfFailures);
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
