/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useOutletContext, useParams } from 'react-router-dom';
import { TopProgressBar } from '../../../components';
import { useEntityByCode, useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { StickyMobileHeader } from '../../../layout';

const CountryName = styled.span`
  padding-left: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
`;

type SurveyLayoutContextT = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

export const MobileSurveyHeader = () => {
  const { screenNumber, numberOfScreens, isResponseScreen, openCancelConfirmation } =
    useSurveyForm();
  const { surveyCode, screenNumber: screenNumberParam, countryCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const { data: country } = useEntityByCode(countryCode!);
  const { onStepPrevious } = useOutletContext<SurveyLayoutContextT>();

  if (isResponseScreen) {
    return null;
  }

  const getDisplaySurveyName = () => {
    const maxSurveyNameLength = 50;
    if (!survey?.name) return '';

    const surveyName = survey.name;

    return surveyName.length > maxSurveyNameLength
      ? `${surveyName.slice(0, maxSurveyNameLength)}...`
      : surveyName;
  };
  const surveyName = getDisplaySurveyName();
  const countryName = country?.name || '';

  return (
    <>
      <StickyMobileHeader
        title={
          <>
            {surveyName}
            {<CountryName>| {countryName}</CountryName>}
          </>
        }
        onBack={onStepPrevious}
        onClose={openCancelConfirmation}
      />
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </>
  );
};
