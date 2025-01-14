import React from 'react';
import MuiAvatar, { AvatarProps as MuiAvatarProps } from '@material-ui/core/Avatar';

interface AvatarProps extends MuiAvatarProps {
  initial?: string;
  avatarColors?: string[];
}

export const Avatar = React.memo(
  ({
    initial = '',
    avatarColors = ['#D13333', '#02B851', '#EF5A06', '#D434E2', '#856226'],
    ...props
  }: AvatarProps) => {
    const avatarColor = avatarColors[initial.charCodeAt(0) % avatarColors.length];
    return <MuiAvatar {...props} style={{ backgroundColor: avatarColor }} />;
  },
);
