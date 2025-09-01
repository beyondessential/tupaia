import React from 'react';
import { generatePath, Navigate, Route, useParams } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { ROUTES } from '../constants';
import {
  ErrorPage,
  SurveyPage,
  SurveyReviewScreen,
  SurveyScreen,
  SurveySuccessScreen,
  SurveyResubmitSuccessScreen,
} from '../views';
import { SurveyLayout, useSurveyForm } from '../features';
import { useCurrentUserContext, useSurvey } from '../api';
import { SurveyResubmitRoute } from './SurveyResponseRoute';

// Redirect to the start of the survey if no screen number is provided
const SurveyStartRedirect = ({ baseRoute = ROUTES.SURVEY_SCREEN }) => {
  const params = useParams();
  const path = generatePath(baseRoute, { ...params, screenNumber: '1' });
  return <Navigate to={path} replace={true} />;
};

// Redirect to the start of the survey if they try to access a screen that is not visible on the survey
const SurveyPageRedirect = ({ children, baseRoute = ROUTES.SURVEY_SCREEN }) => {
  const { screenNumber } = useParams();
  const { visibleScreens } = useSurveyForm();

  if (visibleScreens?.length && visibleScreens.length < Number(screenNumber)) {
    return <SurveyStartRedirect baseRoute={baseRoute} />;
  }
  return children;
};

const SurveyRoute = ({ children }) => {
  const { isLoggedIn } = useCurrentUserContext();
  const { surveyCode } = useParams();
  const { isError, error, isLoading } = useSurvey(surveyCode);

  if (isLoading) {
    return <FullPageLoader />;
  }
  // Redirect to login page if the user is not logged in, otherwise show an error page
  if (isError) {
    return isLoggedIn ? (
      <ErrorPage errorMessage={(error as Error)?.message} title="Unable to fetch survey" />
    ) : (
      <Navigate
        to="/login"
        replace={true}
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return children;
};

const SurveyResubmitRedirect = () => {
  const params = useParams();
  return (
    <Navigate
      to={generatePath(ROUTES.SURVEY_RESUBMIT_SCREEN, {
        ...params,
        screenNumber: '1',
      })}
      replace={true}
    />
  );
};

export const SurveyRoutes = (
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
    <Route path={ROUTES.SURVEY_RESUBMIT_SUCCESS} element={<SurveyResubmitSuccessScreen />} />
    <Route element={<SurveyLayout />}>
      <Route path={ROUTES.SURVEY_REVIEW} element={<SurveyReviewScreen />} />
      <Route
        path={ROUTES.SURVEY_SCREEN}
        element={
          <SurveyPageRedirect>
            <SurveyScreen />
          </SurveyPageRedirect>
        }
      />
      <Route element={<SurveyResubmitRoute />}>
        <Route path={ROUTES.SURVEY_RESUBMIT} element={<SurveyResubmitRedirect />} />
        <Route
          path={ROUTES.SURVEY_RESUBMIT_SCREEN}
          element={
            <SurveyPageRedirect baseRoute={ROUTES.SURVEY_RESUBMIT_SCREEN}>
              <SurveyScreen />
            </SurveyPageRedirect>
          }
        />
        <Route path={ROUTES.SURVEY_RESUBMIT_REVIEW} element={<SurveyReviewScreen />} />
      </Route>
    </Route>
  </Route>
);
