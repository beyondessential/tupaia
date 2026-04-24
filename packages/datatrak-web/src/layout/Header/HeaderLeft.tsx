import React from 'react';
import { useNavigate } from 'react-router';
import { useIsMobile } from '../../utils';
import { DesktopHeaderLeft } from './DesktopHeaderLeft';
import { MobileHeaderLeft } from './MobileHeaderLeft';

export const HeaderLeft = () => {
  const navigate = useNavigate();
  const LeadingContent = useIsMobile() ? MobileHeaderLeft : DesktopHeaderLeft;
  return <LeadingContent onClickLogo={() => void navigate('/')} />;
};
