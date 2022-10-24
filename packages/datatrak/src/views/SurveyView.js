/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FlexColumn } from '../components';

const Container = styled(FlexColumn)`
  padding-top: 3rem;
  min-height: 100vh;
  background: lightblue;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: white;
`;

export const SurveyView = () => {
  return (
    <Container>
      <Title>Survey View</Title>
    </Container>
  );
};
