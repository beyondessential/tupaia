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

const Header = styled.div`
  align-items: center;
  border-block-end: 1pt solid #444;
  color: #444;
  display: flex;
  justify-content: space-between;
  margin-block-end: 1rem;
  padding-block-end: 0.75rem;
  line-height: 1.5;
`;

const ProjectLogo = styled.img`
  height: 4rem;
  object-fit: contain;
  width: 5rem;
`;

const SurveyResponseDetailsWrapper = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  > * {
    font-size: 0.75rem;
    text-align: end;
  }
`;

const SurveyTitle = styled(Typography)`
  color: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  line-height: inherit;
  margin-block-end: 0.25rem;
`;

const SurveyResponseDetails = styled(Typography)`
  color: inherit;
  font-weight: inherit;
  line-height: inherit;
`;

const ScreenWrapper = styled.div`
  padding-block: 0.5rem;
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

  const { answers, endTime, entityParentName, entityName, assessorName } = surveyResponse;

  const visibleScreens =
    survey?.screens
      ?.map(screen =>
        screen.surveyScreenComponents.filter(question => getIsQuestionVisible(question, answers)),
      )
      .filter(screenComponents => screenComponents.length > 0) ?? [];

  // Format the date and time in the timezone provided in the URL because the server is in UTC
  const formattedDataTime = displayDate(endTime, locale);

  return (
    <A4Page>
      <Header>
        <ProjectLogo
          src={survey?.project?.logoUrl || '/tupaia-logo-dark.svg'}
          alt={survey?.project?.name}
          crossOrigin=""
        />
        <SurveyResponseDetailsWrapper>
          <SurveyTitle>
            {survey?.project?.name} | {survey?.name}
          </SurveyTitle>
          <SurveyResponseDetails>
            {entityName} {entityParentName && `| ${entityParentName}`}{' '}
            <time dateTime={new Date(endTime).toISOString()}>{formattedDataTime}</time>
          </SurveyResponseDetails>
          <SurveyResponseDetails>Submitted by: {assessorName}</SurveyResponseDetails>
        </SurveyResponseDetailsWrapper>
      </Header>
      {visibleScreens.map((screenComponents, index) => (
        <ScreenWrapper key={`screen-${index}`}>
          {screenComponents.map(surveyScreenComponent => (
            <Question
              key={surveyScreenComponent.id}
              surveyScreenComponent={surveyScreenComponent}
              surveyResponse={surveyResponse}
            />
          ))}
        </ScreenWrapper>
      ))}
    </A4Page>
  );
};
