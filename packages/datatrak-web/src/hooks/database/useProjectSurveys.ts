import { RECORDS } from '@tupaia/database';
import { ResultObject, useDatabaseEffect } from './useDatabaseEffect';

export type SurveyData = {
  id: string;
  name: string;
  code: string;
  surveyGroupName: string;
};

export const useProjectSurveys = (
  projectId?: string,
  countryCode?: string,
): ResultObject<SurveyData[]> =>
  useDatabaseEffect(
    async models => {
      const countryId = countryCode
        ? (await models.country.findOne({ code: countryCode })).id
        : null;

      const surveys = await models.survey.find(
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
      );

      return surveys as unknown as SurveyData[];
    },
    [projectId, countryCode],
  );
