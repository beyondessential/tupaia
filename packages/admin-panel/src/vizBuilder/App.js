/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Tabs, Toolbar, JsonEditor, FlexSpaceBetween } from './components';
import styled from 'styled-components';
import { useUser } from './api/queries';
import { FullPageLoader } from './components/FullPageLoader';

const Main = styled.main`
  background: #e5e5e5;
  height: 100vh;
`;

const Container = styled(FlexSpaceBetween)`
  align-items: flex-start;
`;

const RightCol = styled.section`
  //background: #e5e5e5;
  //height: 100vh;
`;

export const App = () => {
  const { isLoading: isUserLoading, isBESAdmin } = useUser();
  if (isUserLoading) {
    return <FullPageLoader />;
  }

  if (!isBESAdmin) {
    // return <Redirect to="/" />;
  }

  return (
    <Main>
      <Toolbar />
      <Container>
        <Tabs />
        <RightCol />
      </Container>
    </Main>
  );
};
