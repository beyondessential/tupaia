import React, { createContext, Dispatch, useContext, useMemo, useReducer, useState } from 'react';
import { To, useMatch, useParams, useSearchParams } from 'react-router-dom';

import { Country, QuestionType, Survey } from '@tupaia/types';
import { useSurvey } from '../../../api';
import { PRIMARY_ENTITY_CODE_PARAM, ROUTES } from '../../../constants';
import { SurveyParams } from '../../../types';
import { getAllSurveyComponents, getPrimaryEntityParentQuestionIds } from '../utils';
import { usePrimaryEntityQuestionAutoFill } from '../utils/usePrimaryEntityQuestionAutoFill';
import { ACTION_TYPES, SurveyFormAction } from './actions';
import { SurveyFormContextType, surveyReducer } from './reducer';
import {
  generateCodeForCodeGeneratorQuestions,
  getDisplayQuestions,
  getIsQuestionVisible,
  getUpdatedFormData,
} from './utils';

const defaultContext = {
  activeScreen: [],
  cancelModalConfirmLink: '/',
  cancelModalOpen: false,
  countryCode: '',
  displayQuestions: [],
  formData: {},
  isLast: false,
  isResponseScreen: false,
  isResubmit: false,
  isReviewScreen: false,
  isSuccessScreen: false,
  numberOfScreens: 0,
  primaryEntityQuestion: null,
  screenDetail: undefined,
  screenHeader: undefined,
  screenNumber: 1,
  sideMenuOpen: false,
  startTime: new Date().toISOString(),
  surveyCode: undefined,
  surveyProjectCode: undefined,
  surveyScreens: [],
  surveyStartTime: undefined,
  visibleScreens: undefined,
} as SurveyFormContextType;

const SurveyFormContext = createContext(defaultContext);

const SurveyFormDispatchContext = createContext<Dispatch<SurveyFormAction> | null>(null);

export const SurveyContext = ({
  children,
  surveyCode,
  countryCode,
}: {
  children: React.ReactNode;
  countryCode: Country['code'] | undefined;
  surveyCode: Survey['code'] | undefined;
}) => {
  const [urlSearchParams] = useSearchParams();
  const [prevSurvey, setPrevSurvey] = useState<ReturnType<typeof useSurvey>['data'] | null>(null);
  const primaryEntityCodeParam = urlSearchParams.get(PRIMARY_ENTITY_CODE_PARAM) || undefined;
  const [primaryEntityCode] = useState(primaryEntityCodeParam);
  const [state, dispatch] = useReducer(surveyReducer, defaultContext);
  const params = useParams<SurveyParams>();
  const screenNumber = params.screenNumber ? Number.parseInt(params.screenNumber, 10) : null;
  const { data: survey } = useSurvey(surveyCode);

  const _isInitialSubmitReviewScreen = !!useMatch(ROUTES.SURVEY_REVIEW);
  const _isResubmitReviewScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_REVIEW);
  const isReviewScreen = _isInitialSubmitReviewScreen || _isResubmitReviewScreen;

  const _isInitialSubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const _isResubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_SUCCESS);
  const isSuccessScreen = _isInitialSubmitSuccessScreen || _isResubmitSuccessScreen;

  const isResubmit = !!useMatch(`${ROUTES.SURVEY_RESUBMIT}/*`);
  const isResponseScreen = !!urlSearchParams.get('responseId');

  const surveyScreens = survey?.screens || [];
  const flattenedScreenComponents = useMemo(
    () => getAllSurveyComponents(surveyScreens),
    [surveyScreens],
  );

  const primaryEntityQuestion = flattenedScreenComponents.find(
    question => question.type === QuestionType.PrimaryEntity,
  );

  const { data: autoFillAnswers } = usePrimaryEntityQuestionAutoFill(
    primaryEntityQuestion,
    flattenedScreenComponents,
    primaryEntityCode,
  );

  const formData = useMemo(
    () => (primaryEntityCode ? { ...state.formData, ...autoFillAnswers } : state.formData),
    [autoFillAnswers, primaryEntityCode, state.formData],
  );

  // Get the list of parent question ids for the primary entity question
  const primaryEntityParentQuestionIds = useMemo(
    () =>
      new Set(getPrimaryEntityParentQuestionIds(primaryEntityQuestion, flattenedScreenComponents)),
    [primaryEntityQuestion, flattenedScreenComponents],
  );

  // filter out screens that have no visible questions, and the components that are not visible. This is so that the titles of the screens are not using questions that are not visible
  const visibleScreens = useMemo(
    () =>
      surveyScreens
        .map(screen => ({
          ...screen,
          surveyScreenComponents: screen.surveyScreenComponents.filter(question =>
            primaryEntityCode &&
            !isReviewScreen &&
            (question.type === QuestionType.PrimaryEntity ||
              primaryEntityParentQuestionIds.has(question.id))
              ? // If a primary entity code is preset for the survey, hide the primary entity
                // question and its ancestor questions
                false
              : getIsQuestionVisible(question, formData),
          ),
        }))
        .filter(screen => screen.surveyScreenComponents.length > 0),
    [
      formData,
      isReviewScreen,
      surveyScreens,
      primaryEntityCode,
      primaryEntityParentQuestionIds.has,
    ],
  );

  const activeScreen = visibleScreens?.[screenNumber! - 1]?.surveyScreenComponents ?? [];

  // @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (survey !== prevSurvey) {
    const initialiseFormData = () => {
      if (!surveyCode || isResponseScreen || isResubmit) return;
      // If we are on the response screen, we don’t want to initialise the form data, because we
      // want to show the user’s saved answers
      const initialFormData = generateCodeForCodeGeneratorQuestions(
        flattenedScreenComponents,
        formData,
      );
      dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: initialFormData });
      // Update the start time when a survey is started, so that it can be passed on when submitting
      dispatch({
        type: ACTION_TYPES.SET_SURVEY_START_TIME,
        payload: new Date().toISOString(),
      });
    };

    setPrevSurvey(survey);
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
        isResubmit,
        isSuccessScreen,
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

  const numberOfScreens = visibleScreens?.length ?? 0;
  const isLast = screenNumber === numberOfScreens;

  const _isInitialSubmitReviewScreen = !!useMatch(ROUTES.SURVEY_REVIEW);
  const _isResubmitReviewScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_REVIEW);
  const isReviewScreen = _isInitialSubmitReviewScreen || _isResubmitReviewScreen;

  const _isInitialSubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const _isResubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_SUCCESS);
  const isSuccessScreen = _isInitialSubmitSuccessScreen || _isResubmitSuccessScreen;

  const isResubmit = !!useMatch(`${ROUTES.SURVEY_RESUBMIT}/*`);

  const [urlSearchParams] = useSearchParams();
  const isResponseScreen = !!urlSearchParams.get('responseId');

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

  const openCancelConfirmation = ({ confirmPath }: { confirmPath?: To | number }) => {
    dispatch({ type: ACTION_TYPES.OPEN_CANCEL_CONFIRMATION, payload: confirmPath });
  };

  const closeCancelConfirmation = () => {
    dispatch({ type: ACTION_TYPES.CLOSE_CANCEL_CONFIRMATION });
  };

  return {
    ...surveyFormContext,
    isLast,
    isResponseScreen,
    isResubmit,
    isReviewScreen,
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
