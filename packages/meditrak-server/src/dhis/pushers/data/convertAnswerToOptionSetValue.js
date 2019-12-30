/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

const OPTION_SET_CACHE = {};

export const convertAnswerToOptionSetValue = async (dhisApi, questionCode, answerText) => {
  const questionServerHash = `${dhisApi.getServerName()}_${questionCode}`;
  if (!OPTION_SET_CACHE[questionServerHash]) {
    OPTION_SET_CACHE[questionServerHash] = await dhisApi.getOptionsForDataElement(questionCode);
  }
  const options = OPTION_SET_CACHE[questionServerHash];
  const optionCodeForAnswer = options[answerText.toLowerCase()]; // Convert text to lower case so we can ignore case
  if (!optionCodeForAnswer) {
    throw new Error(`No option matching ${answerText} for question ${questionCode}`);
  }
  return optionCodeForAnswer;
};
