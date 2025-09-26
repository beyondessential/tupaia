import { upsertDummyRecord } from '@tupaia/database';
import { randomString } from '@tupaia/utils';
import { getModels } from './getModels';

const models = getModels();

export const upsertAnswer = async data => {
  return upsertDummyRecord(models.answer, data);
};

export const upsertCountry = async data => {
  return upsertDummyRecord(models.country, data);
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

export const upsertQuestion = async (data = {}) => {
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

export const upsertDataElement = async data => {
  return upsertDummyRecord(models.dataElement, data);
};

export const upsertDataGroup = async data => {
  return upsertDummyRecord(models.dataGroup, data);
};

export const upsertSurvey = async data => {
  const augmented = { ...data };

  // Satisfy foreign key constraints
  augmented.permission_group_id ??= (await upsertPermissionGroup({ name: randomString() })).id;
  augmented.project_id ??= (await upsertProject({ code: randomString() })).id;

  return await upsertDummyRecord(models.survey, augmented);
};

export const upsertSurveyGroup = async data => {
  return upsertDummyRecord(models.surveyGroup, data);
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

export const upsertPermissionGroup = async data => {
  return upsertDummyRecord(models.permissionGroup, data);
};

export const upsertProject = async data => {
  return upsertDummyRecord(models.project, data);
};
