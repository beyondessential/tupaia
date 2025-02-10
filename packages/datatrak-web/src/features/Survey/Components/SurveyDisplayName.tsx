import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useEntityByCode, useSurvey } from '../../../api';

const SurveyName = styled.p`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  margin-block: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CountryName = styled(SurveyName)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
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
