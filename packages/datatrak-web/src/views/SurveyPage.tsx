/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSurveyScreenComponents } from '../api/queries';
import { SurveyScreen, SurveyContext } from '../features/Survey';

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams();
  const {
    data: surveyScreenComponents,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useSurveyScreenComponents(surveyCode);
  const activeScreen = surveyScreenComponents[screenNumber];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = parseInt(screenNumber, 10) === numberOfScreens;

  if (isLoading) {
    return 'Loading...';
  }

  if (!isSuccess || (isError && error)) {
    return `There was an error ${error}`;
  }

  return (
    <SurveyContext>
      <SurveyScreen surveyScreen={activeScreen} isLast={isLast} />
    </SurveyContext>
  );
};
