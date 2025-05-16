import React from 'react';
import { HomeLink } from '../../components';

export const DesktopHeaderLeft = ({ onClickLogo }) => {
  return <HomeLink onClick={onClickLogo} />;
};
