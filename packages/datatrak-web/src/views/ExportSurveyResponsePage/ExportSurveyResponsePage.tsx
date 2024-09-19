/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { useSurvey, useSurveyResponse } from '../../api';
import { A4Page } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { displayDate } from '../../utils';
import { Question } from './Questions';
import { getIsQuestionVisible } from '../../features/Survey/SurveyContext/utils';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block-end: 0.75rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #444;
`;

const ScreenWrapper = styled.div`
  & + & {
    margin-block-start: 2rem;
    padding-block-start: 2rem;
  }
`;

const SurveyResponseDetailsWrapper = styled.div`
  > * {
    font-size: 0.75rem;
    text-align: right;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;
const SurveyTitle = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  line-height: 2;
`;

const SurveyResponseDetails = styled(Typography)`
  line-height: 1.5;
`;

const ProjectLogo = styled.img`
  height: 4rem;
  width: auto;
`;

export const ExportSurveyResponsePage = () => {
  const { surveyResponseId } = useParams();
  const { data: surveyResponse, isLoading: isLoadingSurveyResponse } =
    useSurveyResponse(surveyResponseId);
  const { data: survey, isLoading: isLoadingSurvey } = useSurvey(surveyResponse?.surveyCode);

  const isLoading = isLoadingSurveyResponse || isLoadingSurvey;

  if (isLoading || !surveyResponse) return null;

  const { answers } = surveyResponse;

  const visibleScreens =
    survey?.screens
      ?.map(screen =>
        screen.surveyScreenComponents.filter(question => getIsQuestionVisible(question, answers)),
      )
      ?.filter(screenComponents => screenComponents.length > 0) ?? [];

  return (
    <A4Page>
      <Header>
        <ProjectLogo
          src={survey?.project?.logoUrl || '/tupaia-logo-dark.svg'}
          alt={survey?.project?.name}
        />
        <SurveyResponseDetailsWrapper>
          <SurveyTitle>
            {survey?.project?.name} | {survey?.name}
          </SurveyTitle>
          <SurveyResponseDetails>
            {surveyResponse.entityName}{' '}
            {surveyResponse.entityParentName && `| ${surveyResponse.entityParentName}`}{' '}
            {displayDate(surveyResponse.dataTime)}
          </SurveyResponseDetails>
          <SurveyResponseDetails>Submitted by: {surveyResponse.assessorName}</SurveyResponseDetails>
        </SurveyResponseDetailsWrapper>
      </Header>
      {visibleScreens.map((screenComponents, index) => (
        <ScreenWrapper key={`screen-${index}`} className="screen-wrapper">
          {screenComponents.map((surveyScreenComponent, index) => (
            <Question
              key={index}
              surveyScreenComponent={surveyScreenComponent}
              answer={surveyResponse.answers[surveyScreenComponent.id!]}
            />
          ))}
        </ScreenWrapper>
      ))}
    </A4Page>
  );
};
