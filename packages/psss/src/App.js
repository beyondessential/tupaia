import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 5%;
  background: #efefef;
`;

const App = () => (
  <AppContainer>
    <h1>Pacific Syndromic Surveillance System</h1>
  </AppContainer>
);

export default App;
