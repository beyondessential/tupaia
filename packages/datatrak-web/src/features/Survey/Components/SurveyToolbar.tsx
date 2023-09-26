/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { Description } from '@material-ui/icons';
import { TopProgressBar } from '../../../components';
import { useSurvey } from '../../../api/queries';
import { SURVEY_TOOLBAR_HEIGHT } from '../../../constants';
import { useSurveyForm } from '../SurveyContext';
import { useUserCountries } from '../../../utils';

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
  padding: 1.3rem;
`;

const SurveyIcon = styled(Description).attrs({
  color: 'primary',
})`
  margin-right: 0.5rem;
`;

const SurveyTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  display: flex;
  align-items: center;
`;

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

export const SurveyToolbar = () => {
  const { surveyCode } = useParams();
  const { screenNumber, numberOfScreens } = useSurveyForm();
  const { data: survey } = useSurvey(surveyCode);
  const { selectedCountry } = useUserCountries();

  return (
    <Toolbar>
      <SurveyTitleWrapper>
        {survey?.name && (
          <SurveyTitle>
            <SurveyIcon />
            {survey?.name}{' '}
            {selectedCountry?.name && <CountryName>| {selectedCountry?.name}</CountryName>}
          </SurveyTitle>
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
