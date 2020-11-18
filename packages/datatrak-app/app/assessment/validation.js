/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

// Validators return null if there is no error, or a string representing the error message
const answerValidators = {
  isNumber: answer => (isNaN(parseFloat(answer)) ? 'Must be a number' : null),
  min: (answer, minimumValue) =>
    parseFloat(answer) < minimumValue ? `The minimum value is ${minimumValue}` : null,
  max: (answer, maximumValue) =>
    parseFloat(answer) > maximumValue ? `The maximum value is ${maximumValue}` : null,
};

export const validateAnswer = (validationCriteria, answer) => {
  if (!validationCriteria) {
    return null;
  }
  if (validationCriteria.mandatory && (!answer || answer === '')) {
    return 'This is a required field';
  }
  if (!answer || answer === '') {
    return null;
  }
  const validationCriteriaArray = Object.entries(validationCriteria);
  for (let i = 0; i < validationCriteriaArray.length; i++) {
    const [key, value] = validationCriteriaArray[i];
    const errorMessage = answerValidators[key] && answerValidators[key](answer, value);
    if (errorMessage) {
      return errorMessage;
    }
  }
  return null;
};
