import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { PageTitleBar, SurveyIcon, TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { CopyUrlButton } from './CopyUrlButton';
import { Typography } from '@material-ui/core';

const CountryName = styled.span`
  --leading-border-spacing: 0.3rem;
  border-inline-start: max(0.0625rem, 1px) solid currentcolor;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  margin-inline-start: var(--leading-border-spacing);
  padding-inline-start: var(--leading-border-spacing);
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
  const pageTitle = (
    <Typography variant="h1">
      {surveyName}
      {country?.name && <CountryName>{country?.name}</CountryName>}
    </Typography>
  );

  return (
    <PageTitleBar
      heading={pageTitle}
      isTransparent={!screenNumberParam}
      leadingIcon={<SurveyIcon color="primary" />}
      trailingIcon={<StyledCopyUrlButton />}
    >
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </PageTitleBar>
  );
};
