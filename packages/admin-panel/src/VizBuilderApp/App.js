/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { FullPageLoader } from '@tupaia/ui-components';
import { Tabs, Toolbar } from './components';
import { useUser } from './api/queries';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  background: #e5e5e5;
  height: 100vh;
`;

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  align-items: stretch;
`;

const LeftCol = styled.section`
  position: relative;
  width: 400px;
  z-index: 1;

  &:before {
    position: absolute;
    content: '';
    background: white;
    top: 0;
    bottom: 0;
    right: 0;
    width: 10000px;
    z-index: -1;
  }
`;

const RightCol = styled.section`
  flex: 1;
  border: 1px dotted black;
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
    <Main>
      {Navbar && <Navbar user={user} isBESAdmin={isBESAdmin} />}
      <Toolbar />
      <Container>
        <LeftCol>
          <Tabs />
        </LeftCol>
        <RightCol />
      </Container>
      {Footer && <Footer />}
    </Main>
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
