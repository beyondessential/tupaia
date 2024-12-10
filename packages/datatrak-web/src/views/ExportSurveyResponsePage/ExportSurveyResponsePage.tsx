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
import { Question } from './Question';
import { getIsQuestionVisible } from '../../features/Survey/SurveyContext/utils';
import { useSearchParams } from 'react-router-dom';
import { displayDate } from '../../utils';

const Page = styled(A4Page)`
  background-color: white;
  padding-block-start: 0;
  padding-block-end: 1cm;
  padding-inline: 1.55cm;
  width: 21cm; // A4 width in cm
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block-end: 0.75rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #444;
`;

const ScreenWrapper = styled.div`
  padding-block-start: 0.5rem;
  padding-block-end: 0.5rem;
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
  max-height: 4rem;
  width: auto;
  max-width: 5rem;
`;

export const ExportSurveyResponsePage = () => {
  const { surveyResponseId } = useParams();
  const [urlSearchParams] = useSearchParams();
  const { data: surveyResponse, isLoading: isLoadingSurveyResponse } =
    useSurveyResponse(surveyResponseId);
  const locale = urlSearchParams.get('locale') || 'en-AU';
  const { data: survey, isLoading: isLoadingSurvey } = useSurvey(surveyResponse?.surveyCode);

  const isLoading = isLoadingSurveyResponse || isLoadingSurvey;

  if (isLoading || !surveyResponse) return null;

  const { answers, dataTime, entityParentName, entityName, assessorName } = surveyResponse;

  const visibleScreens =
    survey?.screens
      ?.map(screen =>
        screen.surveyScreenComponents.filter(question => getIsQuestionVisible(question, answers)),
      )
      ?.filter(screenComponents => screenComponents.length > 0) ?? [];

  // Format the date and time in the timezone provided in the URL because the server is in UTC
  const formattedDataTime = displayDate(dataTime, locale);

  return (
    <Page>
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
            {entityName} {entityParentName && `| ${entityParentName}`} {formattedDataTime}
          </SurveyResponseDetails>
          <SurveyResponseDetails>Submitted by: {assessorName}</SurveyResponseDetails>
        </SurveyResponseDetailsWrapper>
      </Header>
      {visibleScreens.map((screenComponents, index) => (
        <ScreenWrapper key={`screen-${index}`}>
          {screenComponents.map((surveyScreenComponent, index) => (
            <Question
              key={index}
              surveyScreenComponent={surveyScreenComponent}
              surveyResponse={surveyResponse}
            />
          ))}
        </ScreenWrapper>
      ))}
    </Page>
  );
};
