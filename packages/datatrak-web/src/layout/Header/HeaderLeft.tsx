import React, { useState } from 'react';
import { useMatch } from 'react-router';
import { CancelConfirmModal } from '../../components';
import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';
import { DesktopHeaderLeft } from './DesktopHeaderLeft';
import { MobileHeaderLeft } from './MobileHeaderLeft';

export const HeaderLeft = () => {
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);

  const LeadingContent = useIsMobile() ? MobileHeaderLeft : DesktopHeaderLeft;

  const onClickLogo = e => {
    if (isSurveyScreen && !isSuccessScreen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <LeadingContent onClickLogo={onClickLogo} />
      <CancelConfirmModal isOpen={surveyCancelModalIsOpen} onClose={onClose} />
    </>
  );
};
