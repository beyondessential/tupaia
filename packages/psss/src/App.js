/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  font-family: 'Roboto', sans-serif;
  align-items: center;
  justify-content: center;
  background: #efefef;
`;

const App = () => (
  <AppContainer>
    <h1>Pacific Syndromic Surveillance System</h1>
  </AppContainer>
);

export default App;
