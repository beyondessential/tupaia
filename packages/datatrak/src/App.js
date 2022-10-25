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
import { FlexColumn, Header } from './components';
import { SubmitView } from './views/SubmitView';
import { SuccessView } from './views/SuccessView';

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
  padding-top: 50px;
`;

export const App = () => {
  return (
    <Router>
      <Wrapper>
        <Header />
        <Background>
          <Container>
            <Switch>
              <Route exact path="/login">
                <LoginView />
              </Route>
              <Route exact path="/">
                <ProjectsView />
              </Route>
              <Route exact path="/:projectId/:countryId/surveys">
                <SurveySelectView />
              </Route>
              <Route exact path="/:projectId/:countryId/:surveyId/submit">
                <SubmitView />
              </Route>
              <Route exact path="/:projectId/:countryId/:surveyId/success">
                <SuccessView />
              </Route>
              <Route exact path="/:projectId/:countryId/:surveyId/screen/:screenNumber">
                <SurveyView />
              </Route>
              <Redirect to="/" />
            </Switch>
          </Container>
        </Background>
      </Wrapper>
    </Router>
  );
};
