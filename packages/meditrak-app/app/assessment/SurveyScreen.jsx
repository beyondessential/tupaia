import { connect } from 'react-redux';

import { DumbSurveyScreen } from './DumbSurveyScreen';

import { moveSurveyScreens, moveToSurveyScreen, submitSurvey } from './actions';
import {
  getSurveyName,
  getSurveyScreenIndex,
  getCanSurveyRepeat,
  getErrorMessageForScreen,
} from './selectors';

function mapStateToProps(state) {
  const { assessment } = state;
  const { assessorId, isSubmitting, screens, questions, startTime, surveyId } = assessment;
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
    screenIndex,
    surveyProgress,
    surveyName,
    surveyScreens: screens,
    questions,
  };
}

export const SurveyScreen = connect(mapStateToProps, null, mergeProps)(DumbSurveyScreen);
