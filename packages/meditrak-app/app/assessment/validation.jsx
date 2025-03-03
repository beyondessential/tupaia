// Validators return null if there is no error, or a string representing the error message
const answerValidators = {
  isNumber: answer => (Number.isNaN(Number.parseFloat(answer)) ? 'Must be a number' : null),
  min: (answer, minimumValue) =>
    Number.parseFloat(answer) < minimumValue ? `The minimum value is ${minimumValue}` : null,
  max: (answer, maximumValue) =>
    Number.parseFloat(answer) > maximumValue ? `The maximum value is ${maximumValue}` : null,
};

export const validateAnswer = (validationCriteria, answer) => {
  if (!validationCriteria) {
    return null;
  }
  if (validationCriteria.mandatory && !answer && answer !== 0) {
    return 'This is a required field';
  }
  if (!answer && answer !== 0) {
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
