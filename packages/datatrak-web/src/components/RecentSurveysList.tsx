import React from 'react';
import styled from 'styled-components';

import { useRecentSurveys } from '../hooks/useRecentSurveys';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SurveyButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.primary};

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

interface RecentSurveysListProps {
  countryCode: string;
  onSelectSurvey: (surveyCode: string) => void;
}

export const RecentSurveysList = ({ countryCode, onSelectSurvey }: RecentSurveysListProps) => {
  const { recentSurveys } = useRecentSurveys();

  const surveysForCountry = recentSurveys.filter(s => s.countryCode === countryCode);

  if (surveysForCountry.length === 0) {
    return null;
  }

  return (
    <List>
      {surveysForCountry.map((survey, index) => (
        <li key={index}>
          <SurveyButton onClick={() => onSelectSurvey(survey.code)}>
            {survey.name}
          </SurveyButton>
        </li>
      ))}
    </List>
  );
};
