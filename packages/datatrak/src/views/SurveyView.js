/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FlexColumn } from '../components';
import { SurveyForm } from '../components/SurveyForm';
import { useSurveyScreenComponents } from '../api/queries';

const Container = styled(FlexColumn)`
  padding: 1rem;
  background: white;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
`;

export const SurveyView = () => {
  const { projectId, countryId, surveyId } = useParams();
  const surveyScreenComponents = useSurveyScreenComponents();

  return (
    <Container>
      <Title>Survey View</Title>
      <div>Project: {projectId}</div>
      <div>Country: {countryId}</div>
      <div>Survey: {surveyId}</div>
      <SurveyForm surveyScreenComponents={surveyScreenComponents} />
    </Container>
  );
};
