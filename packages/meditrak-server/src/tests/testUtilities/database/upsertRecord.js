/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from '../../getModels';

const models = getModels();

export const upsertAnswer = async data => {
  return upsertDummyRecord(models.answer, data);
};

export const upsertEntity = async data => {
  return upsertDummyRecord(models.entity, data);
};

export const upsertUserEntityPermission = async data => {
  return upsertDummyRecord(models.userEntityPermission, data);
};

export const upsertFacility = async data => {
  return upsertDummyRecord(models.facility, data);
};

export const upsertQuestion = async data => {
  return upsertDummyRecord(models.question, data);
};

export const upsertDataSource = async data => {
  return upsertDummyRecord(models.dataSource, data);
};

export const upsertSurvey = async data => {
  return upsertDummyRecord(models.survey, data);
};

export const upsertSurveyResponse = async data => {
  const publicPermissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
  const user = await models.user.findOne();
  const defaultData = {
    user_id: user.id,
    permission_group_id: publicPermissionGroup.id,
  };

  return upsertDummyRecord(models.surveyResponse, { ...defaultData, ...data });
};

export const upsertComment = async data => {
  return upsertDummyRecord(models.comment, data);
};

export const upsertSurveyResponseComment = async data => {
  return upsertDummyRecord(models.surveyResponseComment, data);
};

export const upsertSurveyScreen = async data => {
  return upsertDummyRecord(models.surveyScreen, data);
};

export const upsertSurveyScreenComponent = async data => {
  return upsertDummyRecord(models.surveyScreenComponent, data);
};
