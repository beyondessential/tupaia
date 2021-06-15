/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

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

  // ---- process creates ----

  async processCreates(creates) {
    try {
      await this.models.wrapInTransaction(async transactingModels => {
        const newSurveyResponses = creates.map(({ newSurveyResponse }) => newSurveyResponse);
        const newAnswers = creates.map(({ answers }) => answers).flat();
        await transactingModels.surveyResponse.createMany(newSurveyResponses);
        await transactingModels.answer.createMany(newAnswers);
      });
      return { failures: [] };
    } catch (error) {
      return {
        failures: creates.map(create => ({
          ...create,
          error: `Error creating survey responses in bulk: ${error.message}`,
        })),
      };
    }
  }

  // ---- process updates ----

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

  // ---- process deletes ----

  async processDeletes(deletes) {
    try {
      await this.models.wrapInTransaction(async transactingModels => {
        const surveyResponseIds = deletes.map(({ surveyResponseId }) => surveyResponseId);
        await transactingModels.surveyResponse.delete({ id: surveyResponseIds });
      });
      return { failures: [] };
    } catch (error) {
      return {
        failures: deletes.map(d => ({
          ...d,
          error: `Error deleting survey responses in bulk: ${error.message}`,
        })),
      };
    }
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

  async processInSingleTransaction() {
    await this.models.wrapInTransaction(async transactingModels => {
      for (const update of Object.values(this.updatesByResponseId)) {
        try {
          await this.processUpdate(transactingModels, update);
        } catch (error) {
          const { sheetName, surveyResponseId, type } = update;
          throw new Error(
            `Couldn't process ${sheetName}, ${surveyResponseId} to the database (${type})`,
          );
        }
      }
    });
  }
}
