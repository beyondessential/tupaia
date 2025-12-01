import { synchroniseDatabase } from '../../../sync';
import { getCurrentUserLocation, stopWatchingUserLocation } from '../../../utilities/userLocation';
import { SURVEY_SUBMIT, SURVEY_SUBMIT_SUCCESS } from '../../constants';
import { addMessage } from '../../../messages';
import { goBack } from '../../../navigation';
import { getScreens, getSurveyName, getValidQuestions } from '../../selectors';
import { selectSurvey, validateScreen } from '../actions';
import { doesScreenHaveValidationErrors } from '../../helpers';
import { goToQrCodesPage } from '../../../navigation/actions';
import { createUpsertEntityObjects } from './createUpsertEntityObjects';
import { generateQrCodes } from './generateQrCodes';
import { createNewOptions } from './createNewOptions';
import { processSurveyResponse } from './processSurveyResponse';

const getValidatedScreens = (dispatch, getState) => {
  const screens = getScreens(getState());
  screens.forEach((screen, screenIndex) => {
    dispatch(validateScreen(screenIndex));
  });

  return getScreens(getState()); // Re-fetch state now validation is added
};

export const submitSurvey =
  (surveyId, userId, startTime, questions, shouldRepeat) =>
  async (dispatch, getState, { database, analytics }) => {
    const validatedScreens = getValidatedScreens(dispatch, getState);
    if (validatedScreens.some(screen => doesScreenHaveValidationErrors(screen))) {
      return; // Early return, do not submit if there are validation errors
    }
    dispatch({ type: SURVEY_SUBMIT });

    // Skip duplicate survey responses.
    const existingSurveyResponses = database.findSurveyResponses({ surveyId, startTime });

    let qrCodes = [];

    const surveyName = getSurveyName(getState());

    // Only save the survey if it isn't a duplicate.
    if (existingSurveyResponses.length === 0) {
      const validQuestions = getValidQuestions(getState(), questions, validatedScreens);
      const upsertEntityObjects = await createUpsertEntityObjects(
        dispatch,
        getState,
        database,
        validQuestions,
      );
      qrCodes = generateQrCodes(getState, validQuestions, upsertEntityObjects);
      const newOptions = createNewOptions(getState, database, validQuestions);
      const { responseFields, answersToSubmit } = await processSurveyResponse(
        getState,
        database,
        userId,
        validQuestions,
      );
      const endTime = new Date().toISOString();
      const location = await getCurrentUserLocation(getState(), 1000);
      const response = {
        surveyId,
        assessorName: database.getCurrentUser().name,
        startTime,
        userId,
        metadata: JSON.stringify({ location }),
        endTime,
        dataTime: endTime, // Use endTime as default. May be changed by question processing above
        ...responseFields,
      };

      database.saveSurveyResponse(response, answersToSubmit, {
        entityObjects: upsertEntityObjects,
        optionObjects: newOptions,
      });
      analytics.trackEvent('Submit Survey', response);
    }

    const isGeneratingQrCodes = qrCodes.length > 0;

    dispatch(synchroniseDatabase());
    dispatch({ type: SURVEY_SUBMIT_SUCCESS });
    dispatch(addMessage('submit_survey', 'Survey submitted'));

    const exitSurvey = () => {
      dispatch(stopWatchingUserLocation());
      dispatch(goBack(false));
    };

    if (shouldRepeat) {
      dispatch(selectSurvey(surveyId, true));
    } else if (isGeneratingQrCodes) {
      dispatch(
        goToQrCodesPage(surveyName, qrCodes, () => {
          dispatch(goBack(false)); // Go back to survey then exit
          exitSurvey();
        }),
      );
    } else {
      exitSurvey();
    }
  };
