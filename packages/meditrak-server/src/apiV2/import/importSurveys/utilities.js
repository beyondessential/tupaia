/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { splitStringOn, splitStringOnFirstOccurrence } from '../../utilities';

export const MAX_SURVEY_CODE_GENERATION_ATTEMPTS = 20;

export const caseAndSpaceInsensitiveEquals = (stringA = '', stringB = '') =>
  stringA.toLowerCase().trim() === stringB.toLowerCase().trim();

export const isEmpty = cell => cell === undefined || cell === null || cell.length === 0;

export const isYes = cell => caseAndSpaceInsensitiveEquals(cell, 'yes');

export const isNo = cell => caseAndSpaceInsensitiveEquals(cell, 'no');

export const isYesOrNo = cell => isYes(cell) || isNo(cell);

/**
 * Converts an Excel cell string in the format
 * key: value
 * key: value
 * To a json object in the format
 * {
 *  key: value,
 *  key: value,
 * }
 *
 * @param {string} cellString The string representing the cell in Excel
 * @returns {Object<string, any>}
 */
export const convertCellToJson = (cellString, processValue = value => value) => {
  const jsonObject = {};
  splitStringOn(cellString, '\n')
    .filter(line => line !== '')
    .forEach(line => {
      const [key, value] = splitStringOnFirstOccurrence(line, ':');
      jsonObject[key] = processValue(value);
    });
  return jsonObject;
};

const createSurveyCode = async (models, surveyName) => {
  const baseCode = surveyName
    .match(/\b(\w)/g)
    .join('')
    .toUpperCase();

  let code = baseCode;
  let attemptCount = 0;
  let otherSurveyWithSameCodeExists = false;
  do {
    attemptCount++;
    if (attemptCount > MAX_SURVEY_CODE_GENERATION_ATTEMPTS) {
      throw new Error('Maximum survey code generation attempts reached');
    }

    if (attemptCount > 1) {
      code = `${baseCode}${attemptCount}`;
    }

    otherSurveyWithSameCodeExists = !!(await models.survey.findOne({
      code,
      name: { comparator: '<>', comparisonValue: surveyName },
    }));
  } while (otherSurveyWithSameCodeExists);

  return code;
};

export const findOrCreateSurveyCode = async (models, surveyName) => {
  const survey = await models.survey.findOne({ name: surveyName });
  return survey ? survey.code : createSurveyCode(models, surveyName);
};
