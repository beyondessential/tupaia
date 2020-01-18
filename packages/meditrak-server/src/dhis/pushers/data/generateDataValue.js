/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { formatDateForDHIS2 } from './formatDateForDHIS2';
import { convertAnswerToOptionSetValue } from './convertAnswerToOptionSetValue';
import { ANSWER_TYPES } from '../../../database/models/Answer';
const {
  BINARY,
  CHECKBOX,
  NUMBER,
  DAYS_SINCE,
  MONTHS_SINCE,
  YEARS_SINCE,
  RADIO,
  AUTOCOMPLETE,
  DATE,
  SUBMISSION_DATE,
  ENTITY,
  PRIMARY_ENTITY,
} = ANSWER_TYPES;

export const generateDataValue = async (dhisApi, models, answer) => {
  const question = await models.question.findById(answer.question_id);
  const answerValue = await generateAnswerValue(dhisApi, models, answer, question);
  return {
    dataElement: question.code,
    value: answerValue,
  };
};

const getEntityCodeFromAnswer = async (models, { text: entityId }) => {
  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new Error(`No entity matching id ${entityId}`);
  }
  return entity.code;
};

const generateAnswerValue = async (dhisApi, models, answer, question) => {
  switch (question.type) {
    case BINARY:
    case CHECKBOX:
      return answer.text === 'Yes' ? '1' : '0';
    case NUMBER:
    case DAYS_SINCE:
    case MONTHS_SINCE:
    case YEARS_SINCE:
      return parseFloat(answer.text).toString();
    case RADIO:
    case AUTOCOMPLETE:
      return convertAnswerToOptionSetValue(dhisApi, question.code, answer.text);
    case SUBMISSION_DATE:
    case DATE:
      return formatDateForDHIS2(answer.text);
    case ENTITY:
    case PRIMARY_ENTITY:
      return getEntityCodeFromAnswer(models, answer);
    default:
      return answer.text;
  }
};
