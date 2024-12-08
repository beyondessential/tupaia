/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { TopProgressBar } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { StickyMobileHeader } from '../../../layout';
import { SurveyDisplayName } from './SurveyDisplayName';

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

  if (isResponseScreen) {
    return null;
  }

  return (
    <>
      <StickyMobileHeader
        title={<SurveyDisplayName />}
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
