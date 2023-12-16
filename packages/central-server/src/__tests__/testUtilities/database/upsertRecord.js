/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from './getModels';

export const upsertCountry = async data => {
  const models = getModels();
  return upsertDummyRecord(models.country, data);
};

export const upsertEntity = async data => {
  const models = getModels();
  return upsertDummyRecord(models.entity, data);
};

export const upsertFacility = async data => {
  const models = getModels();
  return upsertDummyRecord(models.facility, data);
};

export const upsertQuestion = async (data = {}) => {
  const models = getModels();
  const { code } = data;

  const dataElement = await upsertDummyRecord(models.dataElement, {
    service_type: 'tupaia',
    ...data,
    code,
  });
  return upsertDummyRecord(models.question, {
    type: 'FreeText',
    ...data,
    code: dataElement.code,
    data_element_id: dataElement.id,
  });
};

export const upsertDataGroup = async data => {
  const models = getModels();
  return upsertDummyRecord(models.dataGroup, data);
};

export const upsertSurvey = async data => {
  const models = getModels();
  return upsertDummyRecord(models.survey, data);
};

export const upsertSurveyGroup = async data => {
  const models = getModels();
  return upsertDummyRecord(models.surveyGroup, data);
};

export const upsertSurveyResponse = async data => {
  const models = getModels();
  const publicPermissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
  const user = await models.user.findOne();
  const defaultData = {
    user_id: user.id,
    permission_group_id: publicPermissionGroup.id,
  };

  return upsertDummyRecord(models.surveyResponse, { ...defaultData, ...data });
};

export const upsertComment = async data => {
  const models = getModels();
  return upsertDummyRecord(models.comment, data);
};

export const upsertSurveyResponseComment = async data => {
  const models = getModels();
  return upsertDummyRecord(models.surveyResponseComment, data);
};

export const upsertSurveyScreen = async data => {
  const models = getModels();
  return upsertDummyRecord(models.surveyScreen, data);
};

export const upsertSurveyScreenComponent = async data => {
  const models = getModels();
  return upsertDummyRecord(models.surveyScreenComponent, data);
};

export const upsertPermissionGroup = async data => {
  const models = getModels();
  return upsertDummyRecord(models.permissionGroup, data);
};
