import { ResultObject, useDatabaseEffect } from './useDatabaseEffect';
import { Survey } from '../../types';

export const useProjectSurveys = (
  projectId?: string,
  countryCode?: string,
): ResultObject<Survey[]> =>
  useDatabaseEffect(
    async models => {
      const countryId = countryCode
        ? (await models.country.findOne({ code: countryCode }))?.id //TODO
        : null;

      const surveys = await models.database.find(
        'survey',
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
          joinWith: 'survey_group',
          joinCondition: ['survey_group.id', 'survey.survey_group_id'],
          columns: [
            { id: 'survey.id' },
            { name: 'survey.name' },
            { code: 'survey.code' },
            { survey_group_name: 'survey_group.name' },
          ],
        },
      );

      return surveys;
    },
    [projectId, countryCode],
  );
