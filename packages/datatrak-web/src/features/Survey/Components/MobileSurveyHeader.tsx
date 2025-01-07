/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TopProgressBar } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { StickyMobileHeader } from '../../../layout';
import { SurveyDisplayName } from './SurveyDisplayName';
import { ROUTES } from '../../../constants';

const StickyHeader = styled(StickyMobileHeader)`
  h2 {
    text-align: center;
  }
`;

type SurveyLayoutContextT = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

export const MobileSurveyHeader = () => {
  const { screenNumber: screenNumberParam } = useParams();
  const { screenNumber, numberOfScreens, isResponseScreen, openCancelConfirmation } =
    useSurveyForm();
  const { onStepPrevious } = useOutletContext<SurveyLayoutContextT>();

  const handleBack = () => {
    if (screenNumber === 1) {
      openCancelConfirmation({ confirmLink: ROUTES.SURVEY_SELECT });
    } else {
      onStepPrevious();
    }
  };

  if (isResponseScreen) {
    return null;
  }

  return (
    <>
      <StickyHeader onBack={handleBack} onClose={openCancelConfirmation}>
        <SurveyDisplayName />
      </StickyHeader>
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </>
  );
};
