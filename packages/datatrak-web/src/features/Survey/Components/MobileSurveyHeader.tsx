import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';

import { TopProgressBar } from '../../../components';
import { ROUTES } from '../../../constants';
import { StickyMobileHeader } from '../../../layout';
import { useSurveyForm } from '../SurveyContext';
import { SurveyDisplayName } from './SurveyDisplayName';

interface SurveyLayoutContextT {
  isLoading: boolean;
  onStepPrevious: () => void;
  hasBackButton: boolean;
}

export const MobileSurveyHeader = () => {
  const { screenNumber: screenNumberParam } = useParams();
  const { numberOfScreens, openCancelConfirmation, screenNumber } = useSurveyForm();
  const { onStepPrevious } = useOutletContext<SurveyLayoutContextT>();

  const handleBack = () => {
    if (screenNumber === 1) {
      openCancelConfirmation({ confirmPath: ROUTES.HOME });
    } else {
      onStepPrevious();
    }
  };

  return (
    <>
      <StickyMobileHeader
        onBack={handleBack}
        onClose={() => openCancelConfirmation({ confirmPath: ROUTES.HOME })}
      >
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
