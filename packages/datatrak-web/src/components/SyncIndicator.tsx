import React from 'react';
import { useTheme } from '@material-ui/core/styles';

import { DotIcon, DotIconProps } from './Icons/Dot';

export const SyncSuccessIcon = (props: DotIconProps) => {
  const { palette } = useTheme();
  return <DotIcon htmlColor={palette.success.main} {...props} />;
};

export const SyncNeutralIcon = (props: DotIconProps) => {
  const { palette } = useTheme();
  return <DotIcon variant="outlined" htmlColor={palette.grey[400]} {...props} />;
};

interface SyncIndicatorProps {
  syncStatus: 'onlineOnly' | 'availableOffline';
}
export const SyncIndicator = ({ syncStatus }: SyncIndicatorProps) =>
  syncStatus === 'onlineOnly' ? (
    <SyncNeutralIcon titleAccess="Online only" />
  ) : (
    <SyncSuccessIcon titleAccess="Available offline" />
  );
