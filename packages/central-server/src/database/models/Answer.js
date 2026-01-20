/* eslint-disable camelcase */

import winston from 'winston';

import { AnswerModel as BaseAnswerModel, DatabaseRecord, RECORDS } from '@tupaia/database';
import { getHook } from '../../hooks';
import { CallbackQueue } from '../../utilities/CallbackQueue';

/** @privateRemarks Re-export for backward compatibility. */
export const ANSWER_TYPES = BaseAnswerModel.types;

// these answer types are not stored as data, because they either don't take any answer, or their data
// is used as metadata for the survey response rather than being stored as a standard answer
export const NON_DATA_ELEMENT_ANSWER_TYPES = [
  ANSWER_TYPES.DATE_OF_DATA,
  ANSWER_TYPES.INSTRUCTION,
  ANSWER_TYPES.PRIMARY_ENTITY,
  ANSWER_TYPES.SUBMISSION_DATE,
];

class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;

  static hookQueue = new CallbackQueue();

  async surveyResponse() {
    return this.otherModels.surveyResponse.findById(this.survey_response_id);
  }

  async question() {
    return this.otherModels.question.findById(this.question_id);
  }

  async isLatestAnswer() {
    const surveyResponse = await this.surveyResponse();

    // this is the latest answer if:
    // - there are no other answers for this question (count === 0, this.question_id)
    // - for this entity (response.entity_id)
    //  - (accounting that one or both could be null, which is a no-match)
    // - that have a newer timestamp (response.data_time)
    const { question_id } = this;
    const { entity_id, data_time } = surveyResponse;

    const result = await this.database.executeSql(
      `
      SELECT EXISTS(
        SELECT
          1
        FROM answer
        JOIN survey_response
          ON survey_response_id = survey_response.id
        WHERE
          question_id = ?
          AND entity_id is not null and entity_id = ?
          AND data_time > ?
      );
    `,
      [question_id, entity_id, data_time],
    );

    return !result[0].exists;
  }

  async runHook() {
    const hooksByQuestionId = await this.otherModels.question.getHooksByQuestionId();
    const hookId = hooksByQuestionId[this.question_id];
    if (!hookId) return; // no hook to run for this answer

    const surveyResponse = await this.surveyResponse();
    if (!surveyResponse) {
      throw new Error(`No survey response with id: ${this.survey_response_id}`);
    }

    // check if we already have more current data
    if (!(await this.isLatestAnswer())) return;

    const hook = getHook(hookId);

    if (!hook) {
      throw new Error(`No hook with id: ${hookId}`);
    }

    await AnswerRecord.hookQueue.add(
      () =>
        hook({
          answer: this,
          models: this.otherModels,
          surveyResponse,
          hookName: hookId,
        }),
      `${hookId}:${this.id}`,
    );
  }
}

export class AnswerModel extends BaseAnswerModel {
  notifiers = [onChangeRunQuestionHook];

  get DatabaseRecordClass() {
    return AnswerRecord;
  }

  types = ANSWER_TYPES;
}

const onChangeRunQuestionHook = async ({ type: changeType, new_record: newRecord }, models) => {
  if (changeType === 'delete') return;
  try {
    const answer = await models.answer.generateInstance(newRecord);
    await answer.runHook();
  } catch (e) {
    winston.error(e);
  }
};
