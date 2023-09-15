/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurvey } from '@tupaia/database';
import { TestModelRegistry } from '../../../types';
import { upsertCountry, upsertEntity, upsertPermissionGroup } from '../../../utilities/database';

export const PERM_SYNC_COUNTRY_1 = {
  code: 'PBS1',
  name: 'Country 1',
  type: 'country',
  country_code: 'PBS1',
};

export const PERM_SYNC_COUNTRY_2 = {
  code: 'PBS2',
  name: 'Country 2',
  type: 'country',
  country_code: 'PBS2',
};

const ENTITIES = [
  PERM_SYNC_COUNTRY_1,
  {
    code: 'PERM_SYNC_FACILITY_1',
    name: 'Facility 1',
    type: 'facility',
    country_code: PERM_SYNC_COUNTRY_1.code,
  },
  PERM_SYNC_COUNTRY_2,
  {
    code: 'PERM_SYNC_FACILITY_2',
    name: 'Facility 2',
    type: 'facility',
    country_code: PERM_SYNC_COUNTRY_2.code,
  },
];

export const PERM_SYNC_PG_ADMIN = { name: 'Permission Based Sync Admin' };
export const PERM_SYNC_PG_PUBLIC = { name: 'Permission Based Sync Public' };

const PERMISSION_GROUPS: { name: string }[] = [PERM_SYNC_PG_ADMIN, PERM_SYNC_PG_PUBLIC];

const QUESTIONS = [
  {
    text: 'Question 1',
    code: 'PERM_SYNC_QUESTION_1',
  },
  {
    text: 'Question 2',
    code: 'PERM_SYNC_QUESTION_2',
  },
  {
    text: 'Question 3',
    code: 'PERM_SYNC_QUESTION_3',
  },
  {
    text: 'Question 4',
    code: 'PERM_SYNC_QUESTION_4',
  },
];

const SURVEYS = [
  {
    code: 'PERM_SYNC_SURVEY_1',
    name: 'Permission based sync survey 1',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [PERM_SYNC_COUNTRY_1.code],
    questions: [QUESTIONS[0], QUESTIONS[1]],
  },
  {
    code: 'PERM_SYNC_SURVEY_2',
    name: 'Permission based sync survey 2',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code],
    questions: [QUESTIONS[0], QUESTIONS[2]],
  },
  {
    code: 'PERM_SYNC_SURVEY_3',
    name: 'Permission based sync survey 3',
    permissionGroup: PERM_SYNC_PG_ADMIN.name,
    countries: [PERM_SYNC_COUNTRY_2.code],
    questions: [QUESTIONS[0]],
  },
  {
    code: 'PERM_SYNC_SURVEY_4',
    name: 'Permission based sync survey 4',
    permissionGroup: PERM_SYNC_PG_ADMIN.name,
    countries: [PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code],
    questions: [QUESTIONS[3]],
  },
  {
    code: 'PERM_SYNC_SURVEY_5',
    name: 'Permission based sync survey 5',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [], // No countries means available to all countries
    questions: [],
  },
];

export const insertPermissionsBasedSyncTestData = async (models: TestModelRegistry) => {
  const countryEntities = ENTITIES.filter(e => e.type === 'country');
  const countries = await Promise.all(
    countryEntities.map(ce => {
      const { code, name } = ce;
      return upsertCountry(models, { code, name });
    }),
  );
  const entities = await Promise.all(ENTITIES.map(e => upsertEntity(models, e)));
  const permissionGroups = await Promise.all(
    PERMISSION_GROUPS.map(pg => upsertPermissionGroup(models, pg)),
  );

  const surveysWithIds = SURVEYS.map(s => {
    const {
      countries: surveyCountries,
      permissionGroup: surveyPermissionGroup,
      ...restOfSurvey
    } = s;

    const countryIds = surveyCountries.map(code => countries.find(c => c.code === code).id);
    const permissionGroupId = permissionGroups.find(pg => pg.name === surveyPermissionGroup).id;

    return { country_ids: countryIds, permission_group_id: permissionGroupId, ...restOfSurvey };
  });

  const surveys = [];
  for (let i = 0; i < surveysWithIds.length; i++) {
    const builtSurvey = await buildAndInsertSurvey(models, surveysWithIds[i] as any);
    surveys.push(builtSurvey);
  }

  return {
    entities,
    countries,
    permissionGroups,
    surveys,
  };
};
