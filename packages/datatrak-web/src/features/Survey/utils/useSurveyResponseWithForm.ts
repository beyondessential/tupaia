import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { getAllSurveyComponents } from '../utils';
import { generateCodeForCodeGeneratorQuestions } from '../SurveyContext/utils';

/**
 * Utility hook to process survey response data and populate the form with it
 */
export const useSurveyResponseWithForm = (
  surveyResponse?: DatatrakWebSingleSurveyResponseRequest.ResBody,
) => {
  const { setFormData, surveyScreens, surveyCode, formData, isResponseScreen } = useSurveyForm();

  const { isLoading, isFetched, isSuccess } = useSurvey(surveyCode);
  const surveyLoading = isLoading || !isFetched;
  const formContext = useFormContext();

  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);

  // Populate the form with the survey response data - this is not in in the onSuccess hook because it doesn't get called if the response has previously been fetched and is in the cache
  useEffect(() => {
    if (!surveyResponse?.id || !isSuccess || !flattenedScreenComponents?.length) return;
    const primaryEntityQuestion = flattenedScreenComponents.find(
      component => component.type === QuestionType.PrimaryEntity,
    );

    const dateOfDataQuestion = flattenedScreenComponents.find(
      component =>
        component.type === QuestionType.DateOfData ||
        component.type === QuestionType.SubmissionDate,
    );
    // handle updating answers here - if this is done in the component, the answers get reset on every re-render
    const formattedAnswers = Object.entries(surveyResponse.answers).reduce((acc, [key, value]) => {
      // If the value is a stringified object, parse it
      const isStringifiedObject = typeof value === 'string' && value.startsWith('{');
      const question = flattenedScreenComponents.find(component => component.questionId === key);
      if (!question) return acc;
      if (question.type === QuestionType.File && value) {
        // If the value is a file, split the value to get the file name
        const withoutPrefix = (value as string).split('files/');
        const fileNameParts = withoutPrefix[withoutPrefix.length - 1].split('_');
        // remove first element of the array as it is the file id
        const fileName = fileNameParts.slice(1).join('_');
        return { ...acc, [key]: { name: fileName, value } };
      }

      if (
        (question.type === QuestionType.Date || question.type === QuestionType.DateTime) &&
        value
      ) {
        // strip timezone from date so that it gets displayed the same no matter the user's timezone
        return { ...acc, [key]: stripTimezoneFromDate(value) };
      }

      return { ...acc, [key]: isStringifiedObject ? JSON.parse(value) : value };
    }, {});

    // Add the primary entity and date of data to the form data
    if (primaryEntityQuestion && surveyResponse.entityId) {
      formattedAnswers[primaryEntityQuestion.questionId] = surveyResponse.entityId;
    }

    if (dateOfDataQuestion && surveyResponse.dataTime) {
      formattedAnswers[dateOfDataQuestion.questionId] = surveyResponse.dataTime;
    }

    const combinedData = { ...formattedAnswers, ...formData };

    // combine this so that formData always takes precedence, and apply a code to any code generator questions without answers when resubmitting. This is because otherwise, if there is no code generator answer already saved, the code generator will not be triggered and the answer will remain empty.
    const newData = isResponseScreen
      ? combinedData
      : generateCodeForCodeGeneratorQuestions(flattenedScreenComponents, combinedData);

    setFormData(newData);
    // Reset the form context with the new answers, to trigger re-render of the form
    formContext.reset(newData);
  }, [surveyResponse?.id, isSuccess, flattenedScreenComponents?.length]);

  return { surveyLoading };
};
