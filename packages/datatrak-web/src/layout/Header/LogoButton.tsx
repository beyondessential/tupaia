/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useMatch } from 'react-router-dom';
import { Button, CancelConfirmModal } from '../../components';
import { HEADER_HEIGHT, ROUTES } from '../../constants';

const Logo = styled(Button)`
  height: ${HEADER_HEIGHT};
  padding: 0;
  background: transparent;
  &:hover {
    background: transparent;
  }
  .MuiButton-label {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0.8rem 0.5rem;
    img {
      max-height: 100%;
    }
  }
`;

export const LogoButton = () => {
  const [leaveSurveyModalIsOpen, setLeaveSurveyModalOpen] = useState(false);
  const openLeaveSurveyModal = () => setLeaveSurveyModalOpen(true);
  const closeLeaveSurveyModal = () => setLeaveSurveyModalOpen(false);

  const [leaveSettingsModalIsOpen, setLeaveSettingsModalIsOpen] = useState(false);
  const openLeaveSettingsModal = () => setLeaveSettingsModalIsOpen(true);
  const closeLeaveSettingsModal = () => setLeaveSettingsModalIsOpen(false);

  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isAccountSettings = !!useMatch(ROUTES.ACCOUNT_SETTINGS);

  const onClickLogo = e => {
    e.preventDefault();
    if (isSurveyScreen && !isSuccessScreen) {
      openLeaveSurveyModal();
    } else if (isAccountSettings) {
      openLeaveSettingsModal();
    }
  };

  return (
    <>
      <Logo component={RouterLink} onClick={onClickLogo} to="/" title="Home">
        <img src="/datatrak-logo-black.svg" alt="Tupaia DataTrak logo" width="100%" height="100%" />
      </Logo>
      <CancelConfirmModal isOpen={leaveSurveyModalIsOpen} onClose={closeLeaveSurveyModal} />
      <CancelConfirmModal
        isOpen={leaveSettingsModalIsOpen}
        onClose={closeLeaveSettingsModal}
        headingText="Leave this page?"
        bodyText="Your changes will not be saved"
        confirmText="Leave page"
        cancelText="Back to editing"
      />
    </>
  );
};
