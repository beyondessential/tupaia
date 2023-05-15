/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { FC, ReactElement } from 'react';
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar';

interface Props extends AvatarProps {
  initial?: string;
  avatarColors?: string[];
}

export const Avatar: FC<Props> = React.memo(
  ({
    initial = '',
    avatarColors = ['#D13333', '#02B851', '#EF5A06', '#D434E2', '#856226'],
    ...props
  }): ReactElement => {
    const avatarColor = avatarColors[initial.charCodeAt(0) % avatarColors.length];
    return <MuiAvatar {...props} style={{ backgroundColor: avatarColor }} />;
  },
);
