/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import { LoginView } from './views/LoginView';
import { ProjectsView } from './views/ProjectsView';
import { SurveySelectView } from './views/SurveySelectView';
import { SurveyView } from './views/SurveyView';
import { Header } from './components';
import { SubmitView } from './views/SubmitView';
import { SuccessView } from './views/SuccessView';
import { AdminRoute } from './components';
import { useUser } from './api/queries';

const Wrapper = styled.div`
  background: #f5f8fb;
  min-height: 100vh;
`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/page-background.svg');
  background-position: center;
  background-size: cover;
  // Get the height from Header.js
  min-height: calc(100vh - 70px);
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 50px 30px 15px;
`;

export const App = () => {
  const { data: user } = useUser();

  return (
    <Router>
      <Wrapper>
        <Header user={user} />
        <Background>
          <Container>
            <Switch>
              <Route exact path="/login">
                <LoginView />
              </Route>
              <AdminRoute exact path="/">
                <ProjectsView />
              </AdminRoute>
              <AdminRoute exact path="/:projectId/:countryId/:entityId/surveys">
                <SurveySelectView />
              </AdminRoute>
              <AdminRoute exact path="/:projectId/:countryId/:entityId/:surveyId/submit">
                <SubmitView />
              </AdminRoute>
              <AdminRoute exact path="/:projectId/:countryId/:entityId/:surveyId/success">
                <SuccessView />
              </AdminRoute>
              <AdminRoute
                exact
                path="/:projectId/:countryId/:entityId/:surveyId/screen/:screenNumber"
              >
                <SurveyView />
              </AdminRoute>
              <Redirect to="/" />
            </Switch>
          </Container>
        </Background>
      </Wrapper>
    </Router>
  );
};
