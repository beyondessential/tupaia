import { useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useSaveSurveyResponseDraft, useUpdateSurveyResponseDraft, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';

export const useSaveAsDraft = () => {
  const { formData, surveyStartTime, screenNumber, draftId, primaryEntityQuestion } =
    useSurveyForm();
  const formContext = useFormContext();
  const { surveyCode, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const navigate = useNavigate();

  const saveDraft = useSaveSurveyResponseDraft();
  const updateDraft = useUpdateSurveyResponseDraft(draftId);

  const isLoading = saveDraft.isLoading || updateDraft.isLoading;

  const saveAsDraft = async () => {
    // Merge current screen's unsaved answers from react-hook-form with formData
    const currentScreenValues = formContext?.getValues() ?? {};
    const mergedFormData = { ...formData, ...currentScreenValues };

    const entityId = primaryEntityQuestion
      ? (mergedFormData[primaryEntityQuestion.questionId] as string | undefined)
      : undefined;

    if (!draftId && (!survey || !countryCode)) {
      console.error('Survey and country code must be available to save a new draft.');
      return;
    }

    if (draftId) {
      await updateDraft.mutateAsync({
        entityId,
        formData: mergedFormData,
        screenNumber: screenNumber ?? 1,
      });
    } else {
      await saveDraft.mutateAsync({
        surveyId: survey!.id,
        countryCode: countryCode!,
        entityId,
        formData: mergedFormData,
        screenNumber: screenNumber ?? 1,
        startTime: surveyStartTime,
      });
    }
    navigate('/');
  };

  return { saveAsDraft, isLoading };
};
