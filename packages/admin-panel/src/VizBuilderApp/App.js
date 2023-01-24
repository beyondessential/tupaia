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

const Container = styled.main`
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  min-height: 100vh;
`;

export const App = ({ Navbar, Footer }) => {
  const { data, isLoading: isUserLoading } = useUser();

  const basePath = useVizBuilderBasePath();

  if (isUserLoading) {
    return <FullPageLoader />;
  }

  const user = { ...data, name: `${data.firstName} ${data.lastName}` };

  return (
    <StateProvider>
      <Container>
        {Navbar && <Navbar user={user} />}
        <Switch>
          <Route path={`${basePath}/viz-builder/:vizType/new`} exact>
            <CreateNew />
          </Route>
          <Route path={`${basePath}/viz-builder/:vizType/:visualisationId?`}>
            <Main />
          </Route>
        </Switch>
        {Footer && <Footer />}
      </Container>
    </StateProvider>
  );
};

App.propTypes = {
  Navbar: PropTypes.node,
  Footer: PropTypes.node,
};

App.defaultProps = {
  Navbar: null,
  Footer: null,
};
