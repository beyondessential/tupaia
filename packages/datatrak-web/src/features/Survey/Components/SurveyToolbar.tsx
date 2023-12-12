/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useCountry, useCurrentUser, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { useIsMobile } from '../../../utils';

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const SurveyToolbar = () => {
  const user = useCurrentUser();
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen } = useSurveyForm();
  const { data: country } = useCountry(user.project?.code, countryCode);
  const { data: survey } = useSurvey(surveyCode);
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
