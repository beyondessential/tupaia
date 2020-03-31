/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const editSurveyScreenComponent = async (models, id, updatedData) => {
  /* eslint-disable camelcase */
  const updates = [];
  const updatedScreenComponentData = {};
  const { question_label, detail_label, config, ...updatedQuestionData } = updatedData;

  if (question_label) {
    updatedScreenComponentData.question_label = question_label;
  }

  if (detail_label) {
    updatedScreenComponentData.detail_label = detail_label;
  }

  if (config) {
    updatedScreenComponentData.config = JSON.stringify(config);
  }

  const screenComponent = await models.surveyScreenComponent.findById(id);
  const screenComponentData = await screenComponent.getData();
  const question = await models.question.findById(screenComponentData.question_id);

  if (Object.entries(updatedScreenComponentData).length > 0) {
    updates.push(
      models.surveyScreenComponent.updateById(screenComponent.id, updatedScreenComponentData),
    );
  }

  if (Object.entries(updatedQuestionData).length > 0) {
    updates.push(models.question.updateById(question.id, updatedQuestionData));
  }

  return Promise.all(updates);
};
