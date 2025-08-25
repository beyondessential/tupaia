import { RECORDS } from '@tupaia/database';
import { ResultObject, useDatabaseEffect } from './useDatabaseEffect';

type SurveyData = {
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

      // TODO: Figure out why importing RECORDS from @tupaia/database is not working,
      const surveys = await models.database.find(
        RECORDS.SURVEY,
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

      return surveys;
    },
    [projectId, countryCode],
  );
