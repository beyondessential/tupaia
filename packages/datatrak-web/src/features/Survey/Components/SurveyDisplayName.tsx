import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useEntityByCode, useSurvey } from '../../../api';

const SurveyName = styled.div`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.875rem;
  line-height: 1.2;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const CountryName = styled(SurveyName)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const SurveyDisplayName = () => {
  const { surveyCode, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);

  if (!survey?.name) return null;

  return (
    <>
      <SurveyName>{survey?.name}</SurveyName>
      <CountryName>{country?.name}</CountryName>
    </>
  );
};
