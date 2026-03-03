import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser } from '../../api';

interface CreateSurveyResponseDraftData {
  surveyId: string;
  countryCode: string;
  entityId?: string | null;
  startTime?: string;
  formData: Record<string, unknown>;
  screenNumber: number;
}

export const createSurveyResponseDraft = async ({
  models,
  user,
  data,
}: {
  models: DatatrakWebModelRegistry;
  user: CurrentUser;
  data: CreateSurveyResponseDraftData;
}) => {
  const { surveyId, countryCode, entityId, startTime, formData, screenNumber } = data;

  const draft = await models.surveyResponseDraft.create({
    survey_id: surveyId,
    user_id: user.id!,
    country_code: countryCode,
    entity_id: entityId ?? null,
    start_time: startTime ?? null,
    form_data: formData,
    screen_number: screenNumber,
  });

  return { id: draft.id };
};
