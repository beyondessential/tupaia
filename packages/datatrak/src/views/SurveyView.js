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
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyId);
  const activeScreen = surveyScreenComponents[screenNumber];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = parseInt(screenNumber, 10) === numberOfScreens;

  return <SurveyScreen surveyScreen={activeScreen} isLast={isLast} />;
};
