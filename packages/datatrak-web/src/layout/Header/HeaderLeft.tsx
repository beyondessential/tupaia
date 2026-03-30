import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAbandonSurveyGuard } from '../../hooks/useAbandonSurveyGuard';
import { useIsMobile } from '../../utils';
import { DesktopHeaderLeft } from './DesktopHeaderLeft';
import { MobileHeaderLeft } from './MobileHeaderLeft';

export const HeaderLeft = () => {
  const navigate = useNavigate();
  const goHome = useCallback(() => void navigate('/'), [navigate]);
  const { guardedCallback, confirmationModal } = useAbandonSurveyGuard(goHome);

  const LeadingContent = useIsMobile() ? MobileHeaderLeft : DesktopHeaderLeft;

  return (
    <>
      <LeadingContent onClickLogo={guardedCallback} />
      {confirmationModal}
    </>
  );
};
