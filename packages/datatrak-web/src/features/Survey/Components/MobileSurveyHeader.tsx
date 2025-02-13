import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TopProgressBar } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { StickyMobileHeader } from '../../../layout';
import { SurveyDisplayName } from './SurveyDisplayName';

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
