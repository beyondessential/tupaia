/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

import { THEME_COLOR_ONE } from '../globalStyles';

export const Icon = ({ library, size, color, ...restOfProps }) => {
  switch (library) {
    case 'Material':
      return <MaterialIcon size={size} color={color} {...restOfProps} />;

    case 'Ionic':
      return <IonIcon size={size} color={color} {...restOfProps} />;

    default:
      return <FAIcon size={size} color={color} {...restOfProps} />;
  }
};

Icon.propTypes = {
  library: PropTypes.oneOf('Material', 'FontAwesome', 'Ionic'),
  size: PropTypes.number,
  color: PropTypes.string,
};

const ICON_SIZE = 36;
const ICON_COLOR = THEME_COLOR_ONE;

Icon.defaultProps = {
  library: 'FontAwesome',
  size: ICON_SIZE,
  color: ICON_COLOR,
};
