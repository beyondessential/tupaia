/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, Text as RText } from 'react-native';

import { THEME_TEXT_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';

export const Text = ({ style, ...props }) => <RText style={[localStyles.text, style]} {...props} />;

Text.propTypes = {
  style: RText.propTypes.style,
};

Text.defaultProps = {
  style: null,
};

const localStyles = StyleSheet.create({
  text: {
    color: THEME_TEXT_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
});
