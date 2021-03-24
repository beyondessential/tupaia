/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Breadcrumbs, LocationHeader } from '../components';
import { DashboardView } from './DashboardView';
import { MapView } from './MapView';

const ToolbarWrapper = styled.section`
  padding-top: 1.1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const EntityView = () => {
  const match = useRouteMatch();
  const { organisationUnitCode } = match.params;

  return (
    <>
      <ToolbarWrapper>
        <Container maxWidth={false}>
          <Breadcrumbs />
          <span>English</span>
        </Container>
      </ToolbarWrapper>
      <LocationHeader />
      <Switch>
        <Route path={`${match.path}/dashboard`}>
          <DashboardView />
        </Route>
        <Route path={`${match.path}/map`}>
          <MapView />
        </Route>
        <Redirect to={`/${organisationUnitCode}/dashboard`} />
      </Switch>
    </>
  );
};
