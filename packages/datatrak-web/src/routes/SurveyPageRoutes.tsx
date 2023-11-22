/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { generatePath, Navigate, Route, useParams } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  ErrorPage,
  SurveyPage,
  SurveyResponsePage,
  SurveyReviewScreen,
  SurveyScreen,
  SurveySuccessScreen,
} from '../views';
import { SurveyLayout, useSurveyForm } from '../features';
import { useSurvey } from '../api';

const SurveyStartRedirect = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY_SCREEN, { ...params, screenNumber: '1' });
  return <Navigate to={path} replace={true} />;
};

// This is to redirect the user to the start of the survey if they try to access a screen that is not visible on the survey
const SurveyPageRedirect = ({ children }) => {
  const { screenNumber } = useParams();
  const { visibleScreens } = useSurveyForm();

  if (visibleScreens && visibleScreens.length && visibleScreens.length < Number(screenNumber)) {
    return <SurveyStartRedirect />;
  }
  return children;
};

/**
 * This is to redirect the user to the survey not found page if they try to access a survey that does not exist
 */
const SurveyNotFoundRedirect = ({ children }) => {
  const { surveyCode } = useParams();
  const { isError, error } = useSurvey(surveyCode);
  if (isError) {
    return <ErrorPage error={error as Error} title="Error fetching survey" />;
  }
  return children;
};

export const SurveyPageRoutes = (
  <Route
    path={ROUTES.SURVEY}
    element={
      <SurveyNotFoundRedirect>
        <SurveyPage />
      </SurveyNotFoundRedirect>
    }
  >
    <Route index element={<SurveyStartRedirect />} />
    <Route path={ROUTES.SURVEY_SUCCESS} element={<SurveySuccessScreen />} />
    <Route element={<SurveyLayout />}>
      <Route path={ROUTES.SURVEY_RESPONSE} element={<SurveyResponsePage />} />
      <Route path={ROUTES.SURVEY_REVIEW} element={<SurveyReviewScreen />} />
      <Route
        path={ROUTES.SURVEY_SCREEN}
        element={
          <SurveyPageRedirect>
            <SurveyScreen />
          </SurveyPageRedirect>
        }
      />
    </Route>
  </Route>
);
