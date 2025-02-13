import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';

import { TopProgressBar } from '../../../components';
import { StickyMobileHeader } from '../../../layout';
import { useSurveyForm } from '../SurveyContext';
import { SurveyDisplayName } from './SurveyDisplayName';

type SurveyLayoutContextT = {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
};

export const MobileSurveyHeader = () => {
  const { screenNumber: screenNumberParam } = useParams();
  const { numberOfScreens, openCancelConfirmation, screenNumber } = useSurveyForm();
  const { onStepPrevious } = useOutletContext<SurveyLayoutContextT>();

  const handleBack = () => {
    if (screenNumber === 1) {
      openCancelConfirmation({
        confirmPath: -1,
      });
    } else {
      onStepPrevious();
    }
  };

  return (
    <>
      <StickyMobileHeader onBack={handleBack} onClose={openCancelConfirmation}>
        <SurveyDisplayName />
      </StickyMobileHeader>
      {screenNumberParam && (
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
      )}
    </>
  );
};
