/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Autocomplete } from '@tupaia/ui-components';
import { ButtonLink } from '../components';
import { useSurveys } from '../api/queries';

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
      <ButtonLink to={`/${projectId}/${countryId}/${survey}/survey`}>Next</ButtonLink>
    </div>
  );
};
