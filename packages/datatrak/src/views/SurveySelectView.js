/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { ButtonLink } from '../components';
import { useSurveys } from '../api/queries';
import styled from 'styled-components';

const Autocomplete = styled(BaseAutocomplete)`
  margin-bottom: 30px;

  .MuiFormLabel-root {
    font-weight: 500;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 28px;
    color: #4e3838;
  }
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
    <div>
      <Autocomplete
        label="Select a survey"
        options={surveyOptions}
        getOptionLabel={option => option.label}
        onChange={(e, { value }) => setSurvey(value)}
      />
      <ButtonLink to={`/${projectId}/${countryId}/${survey}/screen/1`}>Next</ButtonLink>
    </div>
  );
};
