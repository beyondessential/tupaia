import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { useIsMobile } from '../../../utils';
import { CopySurveyUrlButton } from './CopySurveyUrlButton';

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const SurveyToolbar = () => {
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const isMobile = useIsMobile();

  const getDisplaySurveyName = () => {
    const maxSurveyNameLength = 50;
    if (!survey?.name) return '';

    const surveyName = survey.name;

    if (isMobile) {
      return surveyName.length > maxSurveyNameLength
        ? `${surveyName.slice(0, maxSurveyNameLength)}...`
        : surveyName;
    }
    return surveyName;
  };
  const surveyName = getDisplaySurveyName();

  if (isResponseScreen) {
    return null;
  }

  const Title = () => (
    <>
      {surveyName}
      {<CountryName>| {country?.name}</CountryName>}
      <CopySurveyUrlButton />
    </>
  );

  return (
    <PageTitleBar isTransparent={!screenNumberParam} title={<Title />} Icon={SurveyIcon}>
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </PageTitleBar>
  );
};
