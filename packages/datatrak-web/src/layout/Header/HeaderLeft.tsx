import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useIsMobile } from '../../utils';
import { DesktopHeaderLeft } from './DesktopHeaderLeft';
import { MobileHeaderLeft } from './MobileHeaderLeft';

export const HeaderLeft = () => {
  const navigate = useNavigate();
  const goHome = useCallback(() => void navigate('/'), [navigate]);

  const LeadingContent = useIsMobile() ? MobileHeaderLeft : DesktopHeaderLeft;

  return <LeadingContent onClickLogo={goHome} />;
};
