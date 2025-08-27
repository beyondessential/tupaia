import { RECORDS } from '@tupaia/database';
import { DatatrakWebModelRegistry } from '../../types';

export type SurveyData = {
  id: string;
  name: string;
  code: string;
  surveyGroupName: string;
};

export const getProjectSurveys = async (
  models: DatatrakWebModelRegistry,
  projectId?: string,
  countryCode?: string,
) => {
  const countryId = countryCode ? (await models.country.findOne({ code: countryCode })).id : null;

  const surveys = (await models.survey.find(
    {
      ...(projectId && { project_id: projectId }),
      ...(countryId && {
        country_ids: {
          comparator: '@>',
          comparisonValue: [countryId],
        },
      }),
    },
    {
      joinWith: RECORDS.SURVEY_GROUP,
      joinCondition: ['survey_group.id', 'survey.survey_group_id'],
      columns: [
        { id: 'survey.id' },
        { name: 'survey.name' },
        { code: 'survey.code' },
        { surveyGroupName: 'survey_group.name' },
      ],
    },
  )) as unknown as SurveyData[];

  return surveys.map(survey => ({
    id: survey.id,
    name: survey.name,
    code: survey.code,
    surveyGroupName: survey.surveyGroupName,
  }));
};
