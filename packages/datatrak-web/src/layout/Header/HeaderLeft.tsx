/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useMatch } from 'react-router';
import { ROUTES } from '../../constants';
import { CancelConfirmModal } from '../../components';
import { DesktopHeaderLeft } from './DesktopHeaderLeft';
import { MobileHeaderLeft } from './MobileHeaderLeft';

export const HeaderLeft = () => {
  const [surveyCancelModalIsOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);

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
      <DesktopHeaderLeft onClickLogo={onClickLogo} />
      <MobileHeaderLeft onClickLogo={onClickLogo} />
      <CancelConfirmModal isOpen={surveyCancelModalIsOpen} onClose={onClose} />
    </>
  );
};
