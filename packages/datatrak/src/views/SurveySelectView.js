/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { Autocomplete } from '@tupaia/ui-components';
import { FlexColumn } from '../components';
import { useSurveys } from '../api/queries';

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

export const SurveySelectView = () => {
  const { projectId, countryId } = useParams();

  const [survey, setSurvey] = useState(null);
  const { data: surveys = [] } = useSurveys();
  const surveyOptions = surveys.map(s => ({
    value: s.code,
    label: s.name,
  }));

  return (
    <Container>
      <Title>Survey Select View</Title>
      <Autocomplete
        label="Survey"
        options={surveyOptions}
        getOptionLabel={option => option.label}
        onChange={(e, { value }) => setSurvey(value)}
      />
      <Link to={`/${projectId}/${countryId}/${survey}/survey`}>Next</Link>
    </Container>
  );
};
