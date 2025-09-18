import { useMutation } from '@tanstack/react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { post } from '../api';
import { useSurveyResponse } from '../queries';
import { useSurveyForm } from '../../features';
import { ROUTES } from '../../constants';
import { AnswersT, useSurveyResponseData } from './useSubmitSurveyResponse';

export const useResubmitSurveyResponse = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { surveyResponseId } = params;

  const { resetForm } = useSurveyForm();

  const surveyResponseData = useSurveyResponseData();
  const { data: surveyResponse } = useSurveyResponse(surveyResponseId);

  return useMutation<any, Error, AnswersT, unknown>(
    async (answers: AnswersT) => {
      if (!answers || !surveyResponseId) return;

      return await post(`resubmitSurveyResponse/${encodeURIComponent(surveyResponseId)}`, {
        data: {
          ...surveyResponseData,
          answers,
          // keep the same dataTime and userId as the original survey response
          dataTime: surveyResponse?.dataTime ? surveyResponse?.dataTime : new Date(),
          userId: surveyResponse?.userId,
          entityId: surveyResponse?.entityId,
          timezone: surveyResponse?.timezone,
        },
      });
    },
    {
      onSuccess: () => {
        resetForm();
        navigate(generatePath(ROUTES.SURVEY_RESUBMIT_SUCCESS, params));
      },
    },
  );
};
