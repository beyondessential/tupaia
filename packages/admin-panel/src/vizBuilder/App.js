/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Tabs, Toolbar, JsonEditor, Navbar, Footer } from './components';
import { useUser } from './api/queries';
import { FullPageLoader } from './components/FullPageLoader';

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
  //border: 1px dotted black;

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

export const App = () => {
  const { isLoading: isUserLoading, isBESAdmin } = useUser();
  if (isUserLoading) {
    return <FullPageLoader />;
  }

  if (!isBESAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Main>
      <Navbar />
      <Toolbar />
      <Container>
        <LeftCol>
          <Tabs />
        </LeftCol>
        <RightCol />
      </Container>
      <Footer />
    </Main>
  );
};
