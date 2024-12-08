/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useEntityByCode, useSurvey } from '../../../api';

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

const maxSurveyNameLength = 50;

export const SurveyDisplayName = () => {
  const { surveyCode, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);

  if (!survey?.name) return null;

  const surveyName =
    survey.name.length > maxSurveyNameLength
      ? `${survey.name.slice(0, maxSurveyNameLength)}...`
      : survey.name;
  const countryName = country?.name || '';

  return (
    <>
      <span aria-label="survey.name">{surveyName}</span>
      {<CountryName>| {countryName}</CountryName>}
    </>
  );
};
