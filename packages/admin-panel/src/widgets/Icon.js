/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Case from 'case';
import * as fontAwesomeIcons from 'react-icons/lib/fa';

const convertIconName = iconName => `Fa${Case.pascal(iconName)}`;

export const Icon = ({ name, ...restOfProps }) => {
  const FAIcon = fontAwesomeIcons[convertIconName(name)];
  return <FAIcon {...restOfProps} />;
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};
