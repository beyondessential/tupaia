/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSurveyScreenComponents } from '../api/queries';
import { SurveyScreen } from '../components/SurveyScreen';

export const SurveyView = () => {
  const { surveyId, screenNumber } = useParams();
  const {
    data: surveyScreenComponents,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useSurveyScreenComponents(surveyId);
  const activeScreen = surveyScreenComponents[screenNumber];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = parseInt(screenNumber, 10) === numberOfScreens;

  if (isLoading) {
    return 'loading...';
  }

  if (isError && error) {
    return `There was an error ${error}`;
  }

  return isSuccess ? <SurveyScreen surveyScreen={activeScreen} isLast={isLast} /> : null;
};
