/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiAvatar from '@material-ui/core/Avatar';

export const Avatar = React.memo(({ initial, avatarColors, ...props }) => {
  const avatarColor = avatarColors[initial.charCodeAt(0) % avatarColors.length];
  return <MuiAvatar {...props} style={{ backgroundColor: avatarColor }} />;
});

Avatar.propTypes = {
  initial: PropTypes.string,
  avatarColors: PropTypes.array,
};

Avatar.defaultProps = {
  initial: '',
  avatarColors: ['#D13333', '#02B851', '#EF5A06', '#D434E2', '#856226'],
};
