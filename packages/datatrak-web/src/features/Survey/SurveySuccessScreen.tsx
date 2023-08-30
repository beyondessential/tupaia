/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Paper as MuiPaper } from '@material-ui/core';

const Container = styled.div`
  flex: 1;
  display: flex;
  padding-top: 2rem;
  padding-bottom: 2rem;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  overflow: auto;
  padding: 3rem;
  max-width: 70rem;
  margin: 0 auto;
`;
export const SurveySuccessScreen = () => {
  return (
    <Container>
      <Paper>
        <h2>Survey submitted</h2>
      </Paper>
    </Container>
  );
};
