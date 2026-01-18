import generateUUID from 'bson-objectid';
import {
  getCurrentScreen,
  getSelectedCountryId,
  getSurveyScreenIndex,
  getTotalNumberOfScreens,
  getSurveyScreen,
  getSurveyScreenQuestions,
  getAnswerForQuestion,
} from '../selectors';

import {
  ANSWER_CHANGE,
  SURVEY_SCREEN_SELECT,
  SURVEY_SELECT,
  UPDATE_SURVEYS,
  WIPE_CURRENT_SURVEY,
  VALIDATION_ERROR_CHANGE,
  SURVEY_SCREEN_ERROR_MESSAGE_CHANGE,
  SCROLL_CONTROL_ATTACH,
  SCROLL_CONTROL_RELEASE,
} from '../constants';
import { openSurvey, openSurveyGroup } from '../../navigation/actions';
import { watchUserLocation, stopWatchingUserLocation } from '../../utilities/userLocation';
import { validateAnswer } from '../validation';
import { doesScreenHaveValidationErrors, getEntityCreationQuestions } from '../helpers';

const DEFAULT_PRIMARY_QUESTION_ID = 'selected-entity';
const DEFAULT_PRIMARY_ENTITY_QUESTION = {
  id: DEFAULT_PRIMARY_QUESTION_ID,
  questionText: 'Choose a facility, then press next',
  type: 'PrimaryEntity',
  config: {
    entity: {
      filter: {
        type: ['facility'],
      },
    },
  },
};

/**
 * Action creators for the assessment reducer.
 */
export const initialiseSurveys =
  () =>
  (dispatch, getState, { database }) => {
    const surveys = {};
    const state = getState();

    const countryId = getSelectedCountryId(state);
    const surveyList = database.getSurveys(countryId);

    const currentUser = database.getCurrentUser();
    const country = database.getCountry(countryId);
    surveyList
      .filter(survey => currentUser.hasAccessToSurveyInCountry(survey, country))
      .forEach(survey => {
        surveys[survey.id] = survey.getReduxStoreData();
      });

    dispatch({
      type: UPDATE_SURVEYS,
      surveys,
    });
  };

export const changeAnswer = (questionId, newAnswer) => ({
  type: ANSWER_CHANGE,
  questionId,
  newAnswer,
});

export const takeScrollControl = () => ({
  type: SCROLL_CONTROL_ATTACH,
});

export const releaseScrollControl = () => ({
  type: SCROLL_CONTROL_RELEASE,
});

export const continueUnfinishedSurvey = () => dispatch => {
  dispatch(openSurvey());
  dispatch(watchUserLocation());
};

export const wipeCurrentSurvey = () => dispatch => {
  dispatch({ type: WIPE_CURRENT_SURVEY });
  dispatch(stopWatchingUserLocation());
};

const findPrimaryEntityQuestion = questions =>
  questions.find(question => question.type === 'PrimaryEntity');

const findPrimaryEntityComponent = (screens, primaryEntityQuestionId) => {
  for (const screen of screens) {
    for (const component of screen.components) {
      if (component.questionId === primaryEntityQuestionId) {
        return component;
      }
    }
  }

  return null;
};

export const selectSurvey =
  (surveyId, isRepeating = false) =>
  (dispatch, getState, { database, analytics }) => {
    const survey = database.findOne('Survey', surveyId);
    if (!survey) throw new Error(`No survey found with id ${surveyId}`);
    const { screens, questions } = survey.getDataForReduxStore();

    const customPrimaryEntityQuestion = findPrimaryEntityQuestion(Object.values(questions));
    if (!customPrimaryEntityQuestion) {
      // no custom primary entity question, add the default
      questions[DEFAULT_PRIMARY_QUESTION_ID] = DEFAULT_PRIMARY_ENTITY_QUESTION;
      const entityScreen = {
        screenNumber: 0, // screen numbers are 1-indexed
        components: [
          {
            questionId: DEFAULT_PRIMARY_QUESTION_ID,
            visibilityCriteria: {},
            validationCriteria: {},
            questionLabel: null,
            detailLabel: null,
          },
        ],
      };

      screens.unshift(entityScreen);
    }
    const { id: primaryEntityQuestionId } =
      customPrimaryEntityQuestion || DEFAULT_PRIMARY_ENTITY_QUESTION;

    // ensure primary entity question is mandatory
    const primaryEntityComponent = findPrimaryEntityComponent(screens, primaryEntityQuestionId);
    primaryEntityComponent.validationCriteria = {
      ...primaryEntityComponent.validationCriteria,
      mandatory: true,
    };

    const answers = {};
    const userId = database.getCurrentUser().id;

    const entityCreationQuestionIds = getEntityCreationQuestions(Object.values(questions)).map(
      ({ id }) => id,
    );
    entityCreationQuestionIds.forEach(questionId => {
      answers[questionId] = generateUUID().toString();
    });

    dispatch({
      type: SURVEY_SELECT,
      assessorId: userId,
      surveyId,
      screens,
      questions,
      hasCustomEntitySelector: !!customPrimaryEntityQuestion,
      startTime: new Date().toISOString(),
      answers,
      primaryEntityQuestionId,
    });

    if (!isRepeating) {
      dispatch(openSurvey());
      dispatch(watchUserLocation());
    }

    analytics.trackEvent('Select survey', {
      surveyId,
    });
  };

export const selectSurveyGroup = openSurveyGroup;

export const moveToSurveyScreen = toIndex => (dispatch, getState) => {
  dispatch(validateScreen());
  const state = getState(); // Fetch state after validation so it includes new validation errors
  const currentScreen = getCurrentScreen(state);
  if (doesScreenHaveValidationErrors(currentScreen)) {
    // At least one validation error on screen, scroll it to the top and show a notification
    dispatch({
      type: SURVEY_SCREEN_ERROR_MESSAGE_CHANGE,
      message: 'Please fix all validation errors before moving on',
      screenIndex: getSurveyScreenIndex(state),
    });
  } else {
    if (currentScreen) {
      // No validation errors or coming in from another point in the app, set the error message back
      // to blank
      dispatch({
        type: SURVEY_SCREEN_ERROR_MESSAGE_CHANGE,
        message: '',
        screenIndex: getSurveyScreenIndex(state),
      });
    }
    // Navigate to the requested screen
    dispatch({
      type: SURVEY_SCREEN_SELECT,
      screenIndex: toIndex,
    });
  }
};

export const moveSurveyScreens = numberOfScreens => (dispatch, getState) => {
  const state = getState();
  const currentScreenIndex = getSurveyScreenIndex(state);
  const fromIndex = currentScreenIndex === undefined ? -1 : currentScreenIndex;

  let toIndex = fromIndex + numberOfScreens;
  toIndex = Math.min(toIndex, getTotalNumberOfScreens(state));

  dispatch(moveToSurveyScreen(toIndex));
};

export const validateComponent =
  (screenIndex, componentIndex, validationCriteria, answer) => (dispatch, getState) => {
    dispatch({
      type: VALIDATION_ERROR_CHANGE,
      screenIndex,
      componentIndex,
      validationErrorMessage: validateAnswer(validationCriteria, answer),
    });
    // If there was previously a validation error message on this screen, turn off any screen and
    // level error messages that no longer apply
    const screen = getSurveyScreen(getState(), screenIndex);
    if (!!screen.errorMessage && !doesScreenHaveValidationErrors(screen)) {
      dispatch({
        type: SURVEY_SCREEN_ERROR_MESSAGE_CHANGE,
        screenIndex,
        message: '',
      });
    }
  };

export const validateScreen = screenIndex => (dispatch, getState) => {
  const state = getState();
  // If no screen index is specified, validate the current screen
  const screenIndexToValidate =
    screenIndex === undefined ? getSurveyScreenIndex(state) : screenIndex;
  if (screenIndexToValidate === getTotalNumberOfScreens(state)) {
    // This is the submit screen, don't validate.
    return;
  }
  const questions = getSurveyScreenQuestions(state, screenIndexToValidate);
  questions.forEach(({ id: questionId, validationCriteria, componentIndex, checkVisibility }) => {
    if (checkVisibility(state.assessment.answers)) {
      dispatch(
        validateComponent(
          screenIndexToValidate,
          componentIndex,
          validationCriteria,
          getAnswerForQuestion(state, questionId),
        ),
      );
    }
  });
};
