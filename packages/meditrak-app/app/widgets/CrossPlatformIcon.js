/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Platform } from 'react-native';
import { Icon } from './Icon';

export function CrossPlatformIcon({ name, ...restOfProps }) {
  const iconName = Platform.OS === 'android' ? `md-${name}` : `ios-${name}`;

  // Note: library property must appear after restOfProps to override
  // default library prop.
  return <Icon name={iconName} {...restOfProps} library="Ionic" />;
}

CrossPlatformIcon.propTypes = {
  ...Icon.propTypes,
};

CrossPlatformIcon.defaultProps = {
  ...Icon.defaultProps,
};
