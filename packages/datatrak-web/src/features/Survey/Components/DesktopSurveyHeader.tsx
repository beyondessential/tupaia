/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { CopySurveyUrlButton } from './CopySurveyUrlButton';

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const DesktopSurveyHeader = () => {
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);

  if (isResponseScreen) {
    return null;
  }

  const surveyName = survey?.name || '';
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
