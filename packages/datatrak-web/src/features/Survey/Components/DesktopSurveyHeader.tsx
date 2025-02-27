import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { CopyUrlButton } from './CopyUrlButton';

const CountryName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  padding-inline-start: 0.3rem;
`;

const StyledCopyUrlButton = styled(CopyUrlButton)`
  margin-inline-start: 0.5rem;
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
      <StyledCopyUrlButton />
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
