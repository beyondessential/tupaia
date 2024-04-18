/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { Main } from './views/Main';
import { CreateNew } from './views/CreateNew';
import { useUser } from './api/queries';
import { VizConfigProvider as StateProvider } from './context';
import { useVizBuilderBasePath } from './utils';
import { NavPanel } from './components';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.palette.background.default};
  min-height: 100vh;
`;

export const App = ({ Footer }) => {
  const { isLoading: isUserLoading } = useUser();

  const basePath = useVizBuilderBasePath();

  if (isUserLoading) {
    return <FullPageLoader />;
  }

  return (
    <StateProvider>
      <Container>
        <NavPanel />
        <Switch>
          <Route path={`${basePath}/viz-builder/:dashboardItemOrMapOverlay/new`} exact>
            <CreateNew />
          </Route>
          <Route path={`${basePath}/viz-builder/:dashboardItemOrMapOverlay/:visualisationId?`}>
            <Main />
          </Route>
        </Switch>
        {Footer && <Footer />}
      </Container>
    </StateProvider>
  );
};

App.propTypes = {
  Footer: PropTypes.node,
};

App.defaultProps = {
  Footer: null,
};
