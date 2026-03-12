import { useNavigate, useParams } from 'react-router-dom';
import { useSaveSurveyResponseDraft, useUpdateSurveyResponseDraft, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';

export const useSaveAsDraft = () => {
  const { formData, surveyStartTime, screenNumber, draftId, primaryEntityQuestion } =
    useSurveyForm();
  const { surveyCode, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const navigate = useNavigate();

  const saveDraft = useSaveSurveyResponseDraft();
  const updateDraft = useUpdateSurveyResponseDraft(draftId);

  const isLoading = saveDraft.isLoading || updateDraft.isLoading;

  const entityId = primaryEntityQuestion
    ? (formData[primaryEntityQuestion.questionId] as string | undefined)
    : undefined;

  const saveAsDraft = async () => {
    if (draftId) {
      await updateDraft.mutateAsync({
        entityId,
        formData,
        screenNumber: screenNumber ?? 1,
      });
    } else {
      await saveDraft.mutateAsync({
        surveyId: survey!.id,
        countryCode: countryCode!,
        entityId,
        formData,
        screenNumber: screenNumber ?? 1,
        startTime: surveyStartTime,
      });
    }
    navigate('/');
  };

  return { saveAsDraft, isLoading };
};
