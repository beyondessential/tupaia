import { AccessPolicy } from '@tupaia/access-policy';

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

export type PermissionsBasedSyncTestData = {
  countries: any[];
  entities: any[];
  permissionGroups: any[];
  surveys: {
    survey: any;
    surveyScreen: any;
    surveyScreenComponents: any[];
    questions: any[];
    dataGroup: any;
    dataElements: any[];
  }[];
};

export const insertPermissionsBasedSyncTestData = async (
  models: TestModelRegistry,
): Promise<PermissionsBasedSyncTestData> => {
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

export const findRecordsWithPermissions = (
  testData: PermissionsBasedSyncTestData,
  permissions: Record<string, string[]>,
) => {
  const accessPolicy = new AccessPolicy(permissions);
  const countriesWithAccess = accessPolicy.getEntitiesAllowed();
  const countryIdsWithAccess = testData.countries
    .filter(({ code }) => countriesWithAccess.includes(code))
    .map(({ id }) => id);
  const permissionGroupsWithAccess = accessPolicy.getPermissionGroups();
  const permissionGroupIdsWithAccess = testData.permissionGroups
    .filter(({ name }) => permissionGroupsWithAccess.includes(name))
    .map(({ id }) => id);

  const countryRecords = testData.countries.map(r => ({ type: 'country', record: r }));
  const countryEntityRecords = testData.entities
    .filter(({ type }) => type === 'country')
    .map(r => ({ type: 'entity', record: r }));

  const entityRecordsInCountriesWithAccess = testData.entities
    .filter(({ country_code: countryCode }) => countriesWithAccess.includes(countryCode || ''))
    .map(r => ({ type: 'entity', record: r }));

  const permissionGroupRecords = testData.permissionGroups.map(r => ({
    type: 'permission_group',
    record: r,
  }));

  const surveyRelatedRecordsWithAccess = testData.surveys
    .filter(
      ({ survey }) =>
        (survey.country_ids.length === 0 ||
          countryIdsWithAccess.some(cid => survey.country_ids.includes(cid))) &&
        permissionGroupIdsWithAccess.some(pgid => survey.permission_group_id === pgid),
    )
    .flatMap(({ survey, surveyScreen, surveyScreenComponents, questions }) => [
      { type: 'survey', record: survey },
      { type: 'survey_screen', record: surveyScreen },
      ...surveyScreenComponents.map(r => ({ type: 'survey_screen_component', record: r })),
      ...questions.map(r => ({ type: 'question', record: r })),
    ]);

  const allRecords = [
    ...countryRecords,
    ...countryEntityRecords,
    ...entityRecordsInCountriesWithAccess,
    ...permissionGroupRecords,
    ...surveyRelatedRecordsWithAccess,
  ];

  const deduplicatedRecords = allRecords.filter(
    ({ record: r1 }, i) => allRecords.findIndex(({ record: r2 }) => r1.id === r2.id) === i,
  );

  return deduplicatedRecords;
};

export const LEGACY_SSC_SURVEY = {
  code: 'legacy_ssc',
  questions: [
    {
      code: 'legacy_ssc_q1',
      surveyScreenComponent: {
        config: JSON.stringify({
          entity: {
            createNew: true,
            fields: {
              parentId: {
                questionId: 'TEST_QUESTION_ID',
              },
            },
          },
        }),
      },
    },
    {
      code: 'legacy_ssc_q2',
      surveyScreenComponent: {
        config: JSON.stringify({
          entity: undefined,
        }),
      },
    },
    {
      code: 'legacy_ssc_q3',
      surveyScreenComponent: {
        config: JSON.stringify({
          entity: {
            createNew: false,
            filter: {
              type: ['facility'],
            },
            fields: {
              parentId: {
                questionId: 'TEST_QUESTION_ID',
              },
            },
          },
        }),
      },
    },
    {
      code: 'legacy_ssc_q4',
      surveyScreenComponent: {
        config: JSON.stringify({
          entity: {
            createNew: true,
            fields: {
              parentId: {
                questionId: 'TEST_QUESTION_ID',
              },
              type: 'case',
            },
          },
        }),
      },
    },
  ],
};

export const LEGACY_SSC_CONFIGS = {
  legacy_ssc_q1: JSON.stringify({
    entity: {
      createNew: true,
      parentId: {
        questionId: 'TEST_QUESTION_ID',
      },
    },
  }),
  legacy_ssc_q2: JSON.stringify({
    entity: undefined,
  }),
  legacy_ssc_q3: JSON.stringify({
    entity: {
      createNew: false,
      type: ['facility'],
    },
  }),
  legacy_ssc_q4: JSON.stringify({
    entity: {
      createNew: true,
      type: ['case'],
      parentId: {
        questionId: 'TEST_QUESTION_ID',
      },
    },
  }),
};
