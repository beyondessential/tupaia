/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getModels } from '../../getModels';
import { generateDummyRecord } from './generateDummyRecord';

const models = getModels();

export const upsertRecord = async (model, data) => {
  const generatedData = await generateDummyRecord(model, data);
  return model.updateOrCreate({ id: generatedData.id }, generatedData);
};

export const upsertAnswer = async data => {
  return upsertRecord(models.answer, data);
};

export const upsertEntity = async data => {
  return upsertRecord(models.entity, data);
};

export const upsertFacility = async data => {
  return upsertRecord(models.facility, data);
};

export const upsertQuestion = async data => {
  return upsertRecord(models.question, data);
};

export const upsertSurvey = async data => {
  return upsertRecord(models.survey, data);
};

export const upsertSurveyResponse = async data => {
  const publicPermissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
  const user = await models.user.findOne();
  const defaultData = {
    user_id: user.id,
    permission_group_id: publicPermissionGroup.id,
  };

  return upsertRecord(models.surveyResponse, { ...defaultData, ...data });
};

export const upsertSurveyScreen = async data => {
  return upsertRecord(models.surveyScreen, data);
};

export const upsertSurveyScreenComponent = async data => {
  return upsertRecord(models.surveyScreenComponent, data);
};
