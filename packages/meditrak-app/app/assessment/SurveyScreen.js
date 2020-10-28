/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { DumbSurveyScreen } from './DumbSurveyScreen';

import {
  moveSurveyScreens,
  moveToSurveyScreen,
  submitSurvey,
  releaseScrollControl,
} from './actions';
import {
  getSurveyName,
  getSurveyScreenIndex,
  getCanSurveyRepeat,
  getErrorMessageForScreen,
} from './selectors';

function mapStateToProps(state) {
  const { assessment } = state;
  const {
    assessorId,
    isSubmitting,
    screens,
    questions,
    startTime,
    surveyId,
    isChildScrolling,
  } = assessment;
  const screenIndex = getSurveyScreenIndex(state);
  return {
    assessorId,
    canRepeat: getCanSurveyRepeat(state),
    errorMessage: getErrorMessageForScreen(state, screenIndex),
    isSubmitting,
    screenIndex,
    screens,
    questions,
    startTime,
    surveyId,
    surveyName: getSurveyName(state),
    isChildScrolling,
  };
}

function mergeProps(stateProps, { dispatch }, ownProps) {
  const {
    assessorId = 'Unknown',
    canRepeat,
    errorMessage,
    isSubmitting,
    screenIndex,
    screens,
    questions,
    startTime,
    surveyId,
    surveyName,
    isChildScrolling,
    ...otherStateProps
  } = stateProps;
  const isSubmitScreen = screenIndex === screens.length;
  const dispatchSubmitSurvey = shouldRepeat =>
    dispatch(submitSurvey(surveyId, assessorId, startTime, questions, shouldRepeat));
  const surveyProgress = screens ? screenIndex / screens.length : 1;
  return {
    ...ownProps,
    ...otherStateProps,
    canRepeat,
    errorMessage,
    isSubmitting,
    onPressNext: isSubmitScreen ? null : () => dispatch(moveSurveyScreens(1)),
    onPressPrevious: screenIndex !== 0 ? () => dispatch(moveSurveyScreens(-1)) : null,
    onPressRepeat: isSubmitScreen && canRepeat ? () => dispatchSubmitSurvey(true) : null,
    onPressSubmit: isSubmitScreen ? () => dispatchSubmitSurvey(false) : null,
    onSelectSurveyScreen: newScreenIndex => dispatch(moveToSurveyScreen(newScreenIndex)),
    releaseScrollControl: () => dispatch(releaseScrollControl()),
    screenIndex,
    surveyProgress,
    surveyName,
    surveyScreens: screens,
    questions,
    isChildScrolling,
  };
}

export const SurveyScreen = connect(mapStateToProps, null, mergeProps)(DumbSurveyScreen);
