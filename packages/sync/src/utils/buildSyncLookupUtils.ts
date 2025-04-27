import { DatabaseModel } from '@tupaia/database';

import { buildSyncLookupSelect } from './buildSyncLookupSelect';
import { buildSyncLookupTraverseJoins } from './buildSyncLookupTraverseJoins';

export const buildSyncLookupSurveyProjectIdSelect = async (model: DatabaseModel) =>
  buildSyncLookupSelect(model, {
    projectIds: `ARRAY[survey.project_id]`,
  });

export const surveyScreenComponentToSurveyJoins = () =>
  buildSyncLookupTraverseJoins(['survey_screen_component', 'survey_screen', 'survey'], {
    survey_screen_component_survey_screen: {
      fromTable: 'survey_screen_component',
      fromKey: 'screen_id',
      toTable: 'survey_screen',
      toKey: 'id',
    },
  });
