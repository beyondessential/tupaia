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
import { EntitiesView } from './views/EntitiesView';
import { SurveyView } from './views/SurveyView';
import { FlexColumn, Header } from './components';

const Wrapper = styled.div`
  min-height: 100vh;
  background: #efefef;
`;

const Container = styled(FlexColumn)`
  max-width: 800px;
  margin: 3rem auto 0;
`;

export const App = () => {
  return (
    <Router>
      <Wrapper>
        <Header />
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
            <Route exact path="/:projectId/:countryId/:surveyId/entities">
              <EntitiesView />
            </Route>
            <Route exact path="/:projectId/:countryId/:surveyId/:entityId">
              <SurveyView />
            </Route>
            <Redirect to="/" />
          </Switch>
        </Container>
      </Wrapper>
    </Router>
  );
};
