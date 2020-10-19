/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from './Text';
import { THEME_FONT_SIZE_THREE } from '../globalStyles';

export const Heading = ({ text, caps, style, ...textProps }) => (
  <Text style={[localStyles.headingText, style]} {...textProps}>
    {caps ? text.toUpperCase() : text}
  </Text>
);

Heading.propTypes = {
  text: PropTypes.string,
  caps: PropTypes.bool,
  style: Text.propTypes.style,
};

Heading.defaultProps = {
  text: '',
  caps: false,
  style: null,
};

const localStyles = StyleSheet.create({
  headingText: {
    flex: 1,
    fontSize: THEME_FONT_SIZE_THREE,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
