/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { generatePath, Navigate, Route, useParams } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
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
import { PrivateRoute } from './PrivateRoute';

// Redirect to the start of the survey if no screen number is provided
const SurveyStartRedirect = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY_SCREEN, { ...params, screenNumber: '1' });
  return <Navigate to={path} replace={true} />;
};

// Redirect to the start of the survey if they try to access a screen that is not visible on the survey
const SurveyPageRedirect = ({ children }) => {
  const { screenNumber } = useParams();
  const { visibleScreens } = useSurveyForm();

  if (visibleScreens && visibleScreens.length && visibleScreens.length < Number(screenNumber)) {
    return <SurveyStartRedirect />;
  }
  return children;
};

const SurveyRoute = ({ children }) => {
  const { surveyCode } = useParams();
  const { isError, error, isLoading, data: survey } = useSurvey(surveyCode);

  if (isLoading) {
    return <FullPageLoader />;
  }

  // Redirect to survey not found page if survey code does not exist
  if (isError) {
    return <ErrorPage error={error as Error} title="Error fetching survey" />;
  }

  if (!survey?.isPublic) {
    return <PrivateRoute>{children}</PrivateRoute>;
  }

  return children;
};

export const SurveyPageRoutes = (
  <Route
    path={ROUTES.SURVEY}
    element={
      <SurveyRoute>
        <SurveyPage />
      </SurveyRoute>
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
