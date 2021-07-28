/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { Main } from './views/Main';
import { CreateNew } from './views/CreateNew';
import { useUser } from './api/queries';
import { StoreProvider } from './store';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  min-height: 100vh;
`;

export const App = ({ Navbar, Footer }) => {
  const { data, isLoading: isUserLoading, isBESAdmin } = useUser();

  if (isUserLoading) {
    return <FullPageLoader />;
  }

  if (!isBESAdmin) {
    return <Redirect to="/" />;
  }

  const user = { ...data, name: `${data.firstName} ${data.lastName}` };

  return (
    <StoreProvider>
      <Container>
        {Navbar && <Navbar user={user} isBESAdmin={isBESAdmin} />}
        <Switch>
          <Route path="/viz-builder/new" exact>
            <CreateNew />
          </Route>
          <Route path="/">
            <Main />
          </Route>
        </Switch>
        {Footer && <Footer />}
      </Container>
    </StoreProvider>
  );
};

App.propTypes = {
  Navbar: PropTypes.any,
  Footer: PropTypes.any,
};

App.defaultProps = {
  Navbar: null,
  Footer: null,
};
