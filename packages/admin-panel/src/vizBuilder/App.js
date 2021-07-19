/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Tabs, Toolbar, JsonEditor, FlexSpaceBetween } from './components';
import styled from 'styled-components';

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
