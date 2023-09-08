/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { Description } from '@material-ui/icons';
import { TopProgressBar } from '../../components';
import { useSurvey, useSurveyScreenComponents } from '../../api/queries';
import { SURVEY_TOOLBAR_HEIGHT } from '../../constants';

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

export const SurveyToolbar = () => {
  const { surveyCode, screenNumber } = useParams();
  const { data: surveyScreenComponents } = useSurveyScreenComponents(surveyCode);
  const { data: survey } = useSurvey(surveyCode);

  const numberOfScreens = Object.keys(surveyScreenComponents)?.length;
  return (
    <Toolbar>
      <SurveyTitleWrapper>
        {survey?.name && (
          <SurveyTitle>
            <SurveyIcon />
            {survey?.name}
          </SurveyTitle>
        )}
      </SurveyTitleWrapper>
      {screenNumber && (
        <TopProgressBar
          currentSurveyQuestion={Number(screenNumber)}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </Toolbar>
  );
};
