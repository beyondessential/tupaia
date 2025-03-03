import React, { createContext, Dispatch, useContext, useReducer, useState, useMemo } from 'react';
import { useMatch, useParams, useSearchParams } from 'react-router-dom';
import { QuestionType } from '@tupaia/types';
import { PRIMARY_ENTITY_CODE_PARAM, ROUTES } from '../../../constants';
import { SurveyParams } from '../../../types';
import { useSurvey } from '../../../api';
import { getAllSurveyComponents, getPrimaryEntityParentQuestionIds } from '../utils';
import {
  generateCodeForCodeGeneratorQuestions,
  getDisplayQuestions,
  getIsQuestionVisible,
  getUpdatedFormData,
} from './utils';
import { SurveyFormContextType, surveyReducer } from './reducer';
import { ACTION_TYPES, SurveyFormAction } from './actions';
import { usePrimaryEntityQuestionAutoFill } from '../utils/usePrimaryEntityQuestionAutoFill';

const defaultContext = {
  startTime: new Date().toISOString(),
  formData: {},
  activeScreen: [],
  isLast: false,
  isReviewScreen: false,
  isResponseScreen: false,
  numberOfScreens: 0,
  screenNumber: 1,
  screenHeader: '',
  screenDetail: '',
  surveyProjectCode: '',
  displayQuestions: [],
  sideMenuOpen: false,
  cancelModalOpen: false,
  cancelModalConfirmLink: '/',
  countryCode: '',
  primaryEntityQuestion: null,
  isResubmitScreen: false,
  isResubmitReviewScreen: false,
  isResubmit: false,
} as SurveyFormContextType;

const SurveyFormContext = createContext(defaultContext);

export const SurveyFormDispatchContext = createContext<Dispatch<SurveyFormAction> | null>(null);

export const SurveyContext = ({ children, surveyCode, countryCode }) => {
  const [urlSearchParams] = useSearchParams();
  const [prevSurveyCode, setPrevSurveyCode] = useState<string | null>(null);
  const primaryEntityCodeParam = urlSearchParams.get(PRIMARY_ENTITY_CODE_PARAM) || undefined;
  const [primaryEntityCode] = useState(primaryEntityCodeParam);
  const [state, dispatch] = useReducer(surveyReducer, defaultContext);
  const params = useParams<SurveyParams>();
  const screenNumber = params.screenNumber ? Number.parseInt(params.screenNumber!, 10) : null;
  const { data: survey } = useSurvey(surveyCode);
  const isResponseScreen = !!urlSearchParams.get('responseId');
  const isResubmitReviewScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_REVIEW);
  const isReviewScreen = !!useMatch(ROUTES.SURVEY_REVIEW) || isResubmitReviewScreen;
  const isResubmitScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_SCREEN);
  const isResubmit =
    !!useMatch(ROUTES.SURVEY_RESUBMIT) || isResubmitScreen || isResubmitReviewScreen;

  let { formData } = state;

  const surveyScreens = survey?.screens || [];
  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);
  const primaryEntityQuestion = flattenedScreenComponents.find(
    question => question.type === QuestionType.PrimaryEntity,
  );
  const { data: autoFillAnswers } = usePrimaryEntityQuestionAutoFill(
    primaryEntityQuestion,
    flattenedScreenComponents,
    primaryEntityCode,
  );

  if (primaryEntityCode) {
    formData = { ...formData, ...autoFillAnswers };
  }

  // Get the list of parent question ids for the primary entity question
  const primaryEntityParentQuestionIds = useMemo(
    () => getPrimaryEntityParentQuestionIds(primaryEntityQuestion, flattenedScreenComponents),
    [primaryEntityQuestion, flattenedScreenComponents],
  );

  // filter out screens that have no visible questions, and the components that are not visible. This is so that the titles of the screens are not using questions that are not visible
  const visibleScreens = surveyScreens
    .map(screen => {
      return {
        ...screen,
        surveyScreenComponents: screen.surveyScreenComponents.filter(question => {
          // If a primary entity code is pre-set for the survey, hide the primary entity question and its ancestor questions
          if (primaryEntityCode && !isReviewScreen) {
            if (
              question.type === QuestionType.PrimaryEntity ||
              primaryEntityParentQuestionIds.includes(question.id)
            ) {
              return false;
            }
          }
          return getIsQuestionVisible(question, formData);
        }),
      };
    })
    .filter(screen => screen.surveyScreenComponents.length > 0);

  const activeScreen = visibleScreens?.[screenNumber! - 1]?.surveyScreenComponents || [];

  const initialiseFormData = () => {
    if (!surveyCode || isResponseScreen || isResubmit) return;
    // if we are on the response screen, we don't want to initialise the form data, because we want to show the user's saved answers
    const initialFormData = generateCodeForCodeGeneratorQuestions(
      flattenedScreenComponents,
      formData,
    );

    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: initialFormData });
    // update the start time when a survey is started, so that it can be passed on when submitting the survey

    const currentDate = new Date();
    dispatch({
      type: ACTION_TYPES.SET_SURVEY_START_TIME,
      payload: currentDate.toISOString(),
    });
  };

  // @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (surveyCode !== prevSurveyCode) {
    setPrevSurveyCode(surveyCode as string);
    initialiseFormData();
  }

  const displayQuestions = getDisplayQuestions(activeScreen, flattenedScreenComponents);
  const screenHeader = activeScreen?.[0]?.text;
  const screenDetail = activeScreen?.[0]?.detail;

  return (
    <SurveyFormContext.Provider
      value={{
        ...state,
        formData,
        surveyProjectCode: survey?.project?.code,
        activeScreen,
        screenNumber,
        isReviewScreen,
        isResponseScreen,
        displayQuestions,
        surveyScreens,
        screenHeader,
        screenDetail,
        visibleScreens,
        countryCode,
        surveyCode,
        primaryEntityQuestion,
        isResubmitScreen,
        isResubmitReviewScreen,
        isResubmit,
      }}
    >
      <SurveyFormDispatchContext.Provider value={dispatch}>
        {children}
      </SurveyFormDispatchContext.Provider>
    </SurveyFormContext.Provider>
  );
};

export const useSurveyForm = () => {
  const surveyFormContext = useContext(SurveyFormContext);
  const { surveyScreens, formData, screenNumber, visibleScreens } = surveyFormContext;
  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);
  const dispatch = useContext(SurveyFormDispatchContext)!;

  const numberOfScreens = visibleScreens?.length || 0;
  const isLast = screenNumber === numberOfScreens;
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);

  const toggleSideMenu = () => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDE_MENU });
  };

  const setFormData = (newFormData: Record<string, any>) => {
    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: newFormData });
  };

  const updateFormData = (newFormData: Record<string, any>) => {
    const updatedFormData = getUpdatedFormData(newFormData, formData, flattenedScreenComponents);

    setFormData(updatedFormData);
  };

  const resetForm = () => {
    dispatch({ type: ACTION_TYPES.RESET_FORM_DATA });
  };

  const getAnswerByQuestionId = (questionId: string) => {
    return surveyFormContext.formData[questionId];
  };

  const openCancelConfirmation = ({ confirmPath }: { confirmPath?: string | number }) => {
    dispatch({ type: ACTION_TYPES.OPEN_CANCEL_CONFIRMATION, payload: confirmPath });
  };

  const closeCancelConfirmation = () => {
    dispatch({ type: ACTION_TYPES.CLOSE_CANCEL_CONFIRMATION });
  };

  return {
    ...surveyFormContext,
    isLast,
    isSuccessScreen,
    numberOfScreens,
    toggleSideMenu,
    updateFormData,
    setFormData,
    resetForm,
    getAnswerByQuestionId,
    openCancelConfirmation,
    closeCancelConfirmation,
  };
};
