import { assertIsNotNullish } from '@tupaia/tsutils';
import { DatatrakWebModelRegistry } from '../../types';

interface UpdateSurveyResponseDraftData {
  entityId?: string | null;
  formData: Record<string, unknown>;
  screenNumber: number;
}

export const updateSurveyResponseDraft = async ({
  models,
  draftId,
  data,
}: {
  models: DatatrakWebModelRegistry;
  draftId?: string;
  data: UpdateSurveyResponseDraftData;
}) => {
  assertIsNotNullish(draftId, 'updateSurveyResponseDraft called with undefined draftId');

  const { entityId, formData, screenNumber } = data;

  return models.surveyResponseDraft.updateById(draftId, {
    entity_id: entityId ?? null,
    form_data: formData,
    screen_number: screenNumber,
    updated_at: new Date().toISOString(),
  });
};
