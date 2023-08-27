/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 3rem;
  padding: 3rem;
  background: white;
  max-width: 60rem;
  border-radius: 3px;
  border: 1px solid #dfdfdf;
`;
export const SurveySuccessPage = () => {
  return (
    <Container>
      <Typography variant="h4">Survey Success Screen</Typography>
    </Container>
  );
};
