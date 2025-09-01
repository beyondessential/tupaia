import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { getBrowserTimeZone } from '@tupaia/utils';
import { Coconut } from '../../components';
import { post, useCurrentUserContext, useEntityByCode } from '..';
import { ROUTES } from '../../constants';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey } from '../queries';
import { gaEvent, successToast } from '../../utils';

type Answer = string | number | boolean | null | undefined;

export type AnswersT = Record<string, Answer>;

// utility hook for getting survey response data
export const useSurveyResponseData = () => {
  const user = useCurrentUserContext();
  const { surveyCode, countryCode } = useParams();
  const { surveyStartTime, surveyScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const timezone = getBrowserTimeZone();
  return {
    startTime: surveyStartTime,
    surveyId: survey?.id,
    questions: getAllSurveyComponents(surveyScreens), // flattened array of survey questions
    countryId: country?.id,
    userId: user.isLoggedIn ? user.id : null, // Let the server assign the public user if not logged in
    timezone,
  };
};

export const useSubmitSurveyResponse = (from: string | undefined) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { resetForm } = useSurveyForm();
  const user = useCurrentUserContext();
  const { data: survey } = useSurvey(params.surveyCode);
  const surveyResponseData = useSurveyResponseData();

  return useMutation<any, Error, AnswersT, unknown>(
    async (answers: AnswersT) => {
      if (!answers) {
        return;
      }

      return post('submitSurveyResponse', {
        data: { ...surveyResponseData, answers },
      });
    },
    {
      onMutate: () => {
        // Send off survey submissions by survey, project, country, and userId
        gaEvent('submit_survey', params.surveyCode!, survey?.name);
        gaEvent('submit_survey_by_project', user.project?.code!);
        gaEvent('submit_survey_by_country', params.countryCode!);
        gaEvent('submit_survey_by_user', user.id!);
      },
      onSuccess: data => {
        queryClient.invalidateQueries(['surveyResponses']);
        queryClient.invalidateQueries(['recentSurveys']);
        queryClient.invalidateQueries(['rewards']);
        queryClient.invalidateQueries(['leaderboard']);
        queryClient.invalidateQueries(['entityDescendants']); // Refresh recent entities
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['taskMetric', user.projectId]);

        const createNewAutocompleteQuestions = surveyResponseData?.questions?.filter(
          question => question?.config?.autocomplete?.createNew,
        );

        // invalidate optionSet queries for questions that have createNew enabled so that the new options are fetched
        if (createNewAutocompleteQuestions?.length > 0) {
          createNewAutocompleteQuestions.forEach(question => {
            const { optionSetId } = question;
            queryClient.invalidateQueries(['autocompleteOptions', optionSetId]);
          });
        }
        resetForm();
        successToast('Congratulations! You’ve earned a coconut', Coconut);
        // include the survey response data in the location state, so that we can use it to generate QR codes
        navigate(generatePath(ROUTES.SURVEY_SUCCESS, params), {
          state: {
            ...(from && { from }),
            surveyResponse: JSON.stringify(data),
          },
        });
      },
    },
  );
};
