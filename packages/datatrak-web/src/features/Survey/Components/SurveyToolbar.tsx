/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { SurveyIcon, TopProgressBar } from '../../../components';
import { useSurvey, useUser } from '../../../api/queries';
import { SURVEY_TOOLBAR_HEIGHT } from '../../../constants';
import { useSurveyForm } from '../SurveyContext';
import { useIsMobile } from '../../../utils';

const Toolbar = styled.div`
  height: ${SURVEY_TOOLBAR_HEIGHT};
  background: ${({ theme }) => theme.palette.background.paper};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -0.9375rem;
    margin-right: -0.9375rem;
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
  const { surveyCode } = useParams();
  const { screenNumber, numberOfScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { data: user } = useUser();
  const isMobile = useIsMobile();

  const getDisplaySurveyName = () => {
    const maxSurveyNameLength = 50;
    if (!survey?.name) return '';
    if (isMobile) {
      return survey?.name.length > maxSurveyNameLength
        ? `${survey?.name.slice(0, maxSurveyNameLength)}...`
        : survey?.name;
    }
    return survey?.name;
  };
  const surveyName = getDisplaySurveyName();

  return (
    <Toolbar>
      <SurveyTitleWrapper>
        <Icon />
        {survey?.name && (
          <Typography variant="h1">
            {surveyName}
            {user?.country?.name && <CountryName>| {user?.country?.name}</CountryName>}
          </Typography>
        )}
      </SurveyTitleWrapper>
      {screenNumber && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </Toolbar>
  );
};
