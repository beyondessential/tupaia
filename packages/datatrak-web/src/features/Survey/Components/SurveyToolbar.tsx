/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { SurveyIcon, TopProgressBar } from '../../../components';
import { useCountry, useSurvey } from '../../../api';
import { SURVEY_TOOLBAR_HEIGHT } from '../../../constants';
import { useSurveyForm } from '../SurveyContext';
import { useIsMobile } from '../../../utils';
import { CopyPageUrlButton } from './CopyPageUrlButton';

const Toolbar = styled.div<{
  $toolbarIsTransparent?: boolean;
}>`
  height: ${SURVEY_TOOLBAR_HEIGHT};
  background: ${({ theme, $toolbarIsTransparent }) =>
    $toolbarIsTransparent ? 'transparent' : theme.palette.background.paper};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  margin-top: -1px; // make sure this is always visible, even with qr code panel open
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1.25rem;
    margin-right: -1.25rem;
  }
`;

const SurveyTitleWrapper = styled.div`
  padding: 0.8rem;
  display: flex;
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.3rem;
  }
`;

const Icon = styled(SurveyIcon).attrs({
  color: 'primary',
})`
  margin-right: 0.5rem;
`;

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const SurveyToolbar = () => {
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useCountry(survey?.project?.code, countryCode);
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

  return (
    <Toolbar $toolbarIsTransparent={!screenNumberParam}>
      <SurveyTitleWrapper>
        <Icon />
        {survey?.name && (
          <Typography variant="h1">
            {surveyName}
            {<CountryName>| {country?.name}</CountryName>}
            <CopyPageUrlButton />
          </Typography>
        )}
      </SurveyTitleWrapper>
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </Toolbar>
  );
};
