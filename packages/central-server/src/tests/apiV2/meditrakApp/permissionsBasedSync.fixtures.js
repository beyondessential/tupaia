import {
  upsertCountry,
  upsertEntity,
  upsertPermissionGroup,
  upsertProject,
  upsertQuestion,
  upsertSurvey,
  upsertSurveyScreen,
  upsertSurveyScreenComponent,
} from '../../testUtilities';

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

const PERMISSION_GROUPS = [PERM_SYNC_PG_ADMIN, PERM_SYNC_PG_PUBLIC];

const SURVEYS = [
  {
    code: 'PERM_SYNC_SURVEY_1',
    name: 'Permission based sync survey 1',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [PERM_SYNC_COUNTRY_1.code],
  },
  {
    code: 'PERM_SYNC_SURVEY_2',
    name: 'Permission based sync survey 2',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code],
  },
  {
    code: 'PERM_SYNC_SURVEY_3',
    name: 'Permission based sync survey 3',
    permissionGroup: PERM_SYNC_PG_ADMIN.name,
    countries: [PERM_SYNC_COUNTRY_2.code],
  },
  {
    code: 'PERM_SYNC_SURVEY_4',
    name: 'Permission based sync survey 4',
    permissionGroup: PERM_SYNC_PG_ADMIN.name,
    countries: [PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code],
  },
  {
    code: 'PERM_SYNC_SURVEY_5',
    name: 'Permission based sync survey 5',
    permissionGroup: PERM_SYNC_PG_PUBLIC.name,
    countries: [], // No countries means available to all countries
  },
];

const QUESTIONS = [
  {
    code: 'PERM_SYNC_QUESTION_1',
  },
  {
    code: 'PERM_SYNC_QUESTION_2',
  },
  {
    code: 'PERM_SYNC_QUESTION_3',
  },
  {
    code: 'PERM_SYNC_QUESTION_4',
  },
];

const SURVEY_SCREEN_COMPONENTS = [
  {
    survey: 'PERM_SYNC_SURVEY_1',
    question: 'PERM_SYNC_QUESTION_1',
  },
  {
    survey: 'PERM_SYNC_SURVEY_1',
    question: 'PERM_SYNC_QUESTION_2',
  },

  {
    survey: 'PERM_SYNC_SURVEY_2',
    question: 'PERM_SYNC_QUESTION_1',
  },
  {
    survey: 'PERM_SYNC_SURVEY_2',
    question: 'PERM_SYNC_QUESTION_3',
  },

  {
    survey: 'PERM_SYNC_SURVEY_3',
    question: 'PERM_SYNC_QUESTION_1',
  },
  {
    survey: 'PERM_SYNC_SURVEY_3',
    question: 'PERM_SYNC_QUESTION_4',
  },

  {
    survey: 'PERM_SYNC_SURVEY_4',
    question: 'PERM_SYNC_QUESTION_4',
  },
];

export const insertPermissionsBasedSyncTestData = async () => {
  const countryEntities = ENTITIES.filter(e => e.type === 'country');
  const countries = await Promise.all(
    countryEntities.map(ce => {
      const { code, name } = ce;
      return upsertCountry({ code, name });
    }),
  );

  const project = await upsertProject({
    code: 'test_project',
  });
  const entities = await Promise.all(ENTITIES.map(e => upsertEntity(e)));
  const permissionGroups = await Promise.all(
    PERMISSION_GROUPS.map(pg => upsertPermissionGroup(pg)),
  );

  const surveysWithIds = SURVEYS.map(s => {
    const {
      countries: surveyCountries,
      permissionGroup: surveyPermissionGroup,
      ...restOfSurvey
    } = s;

    const countryIds = surveyCountries.map(code => countries.find(c => c.code === code).id);
    const permissionGroupId = permissionGroups.find(pg => pg.name === surveyPermissionGroup).id;

    return {
      country_ids: countryIds,
      permission_group_id: permissionGroupId,
      project_id: project.id,
      ...restOfSurvey,
    };
  });

  const surveys = await Promise.all(surveysWithIds.map(s => upsertSurvey(s)));
  const surveyScreens = await Promise.all(
    surveys.map(s => upsertSurveyScreen({ survey_id: s.id })),
  );
  const questions = await Promise.all(QUESTIONS.map(q => upsertQuestion(q)));

  const surveyScreenComponentsWithIds = SURVEY_SCREEN_COMPONENTS.map(ssc => {
    const {
      survey: surveyScreenComponentSurvey,
      question: surveyScreenComponentQuestion,
      ...restOfSurveyScreenComponent
    } = ssc;

    const surveyId = surveys.find(s => s.code === surveyScreenComponentSurvey).id;
    const screenId = surveyScreens.find(ss => ss.survey_id === surveyId).id;
    const questionId = questions.find(q => q.code === surveyScreenComponentQuestion).id;

    return { screen_id: screenId, question_id: questionId, ...restOfSurveyScreenComponent };
  });

  const surveyScreenComponents = await Promise.all(
    surveyScreenComponentsWithIds.map(ssc => upsertSurveyScreenComponent(ssc)),
  );

  return {
    entities,
    countries,
    permissionGroups,
    surveys,
    surveyScreens,
    surveyScreenComponents,
    questions,
  };
};
