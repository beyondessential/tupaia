/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ExampleComponent, MaterialUIPalette } from './components';

export const Container = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 5%;
  text-align: center;
`;

const App = () => (
  <Container>
    <ExampleComponent title="LESMIS" />
    <MaterialUIPalette />
  </Container>
);

export default App;
