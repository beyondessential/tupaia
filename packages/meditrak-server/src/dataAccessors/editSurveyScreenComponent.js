/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const editSurveyScreenComponent = async (models, id, updatedData) => {
  const screenComponentFields = await models.surveyScreenComponent.fetchFieldNames();
  const updatedScreenComponentData = screenComponentFields.reduce((current, fieldName) => {
    if (!(fieldName in updatedData)) {
      return current;
    }
    if (fieldName === 'config') {
      return { ...current, config: JSON.stringify(updatedData.config) };
    }
    return { ...current, [fieldName]: updatedData[fieldName] };
  }, {});
  const questionFields = await models.question.fetchFieldNames();
  const updatedQuestionData = questionFields.reduce(
    (current, fieldName) =>
      fieldName in updatedData ? { ...current, [fieldName]: updatedData[fieldName] } : current,
    {},
  );
  const updates = [];
  if (Object.entries(updatedScreenComponentData).length > 0) {
    updates.push(models.surveyScreenComponent.updateById(id, updatedScreenComponentData));
  }
  if (Object.entries(updatedQuestionData).length > 0) {
    const screenComponent = await models.surveyScreenComponent.findById(id);
    const question = await screenComponent.question();
    updates.push(models.question.updateById(question.id, updatedQuestionData));
  }

  return Promise.all(updates);
};
