/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SurveyQuestion } from '../features/Survey/SurveyQuestion';

const Card = styled.div`
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 3px;
  border: 1px solid #dfdfdf;
  background: ${({ theme }) => theme.palette.background.paper};
  max-width: 50rem;
`;
export const SurveyQuestionsPage = () => {
  return (
    <Card>
      <h1>Survey Questions Page</h1>
      <SurveyQuestion label="First name" id="firstName" name="firstName" type="FreeText" />
    </Card>
  );
};
