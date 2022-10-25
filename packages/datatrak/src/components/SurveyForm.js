/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SurveyScreen } from './SurveyScreen';
import { useParams } from 'react-router-dom';

const FormContainer = styled.div`
  margin-top: 2rem;
`;

// This component might not be necessary but leaving it here as a placeholder
export const SurveyForm = ({ surveyScreenComponents }) => {
  let { projectId, countryId, surveyId, screenNumber } = useParams();
  // console.log('screenNumber', screenNumber, surveyScreenComponents);
  const activeScreen = surveyScreenComponents[screenNumber];
  // console.log('activeScreen', activeScreen);

  return (
    <FormContainer>
      <SurveyScreen surveyScreen={activeScreen} />
    </FormContainer>
  );
};
