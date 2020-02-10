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

const CODE = 'code';
const ID = 'id';
export const DATA_ELEMENT_ID_SCHEMES = { CODE, ID };

export const generateDataValue = async (dhisApi, models, answer, dataElementIdScheme = CODE) => {
  const question = await models.question.findById(answer.question_id);
  const dataElementId = await getDataElementId(dhisApi, question, dataElementIdScheme);
  const answerValue = await generateAnswerValue(dhisApi, models, answer, question);
  return {
    dataElement: dataElementId,
    value: answerValue,
  };
};

const getDataElementId = async (dhisApi, question, dataElementIdScheme) => {
  if (dataElementIdScheme === CODE) {
    return question.code;
  }
  // Using "id" id scheme, need to fetch the DHIS2 internal id
  const dataElementId = await dhisApi.getIdFromCode(
    DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
    question.code,
  );
  if (!dataElementId) {
    throw new Error(`No data element with code ${question.code}`);
  }
  return dataElementId;
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
