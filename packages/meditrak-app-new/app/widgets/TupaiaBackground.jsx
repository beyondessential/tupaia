/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

import {
  BACKGROUND_COLOR_TOP,
  BACKGROUND_COLOR_BOTTOM,
  THEME_COLOR_ONE,
  THEME_COLOR_LIGHT,
} from '../globalStyles';

export const TUPAIA_BACKGROUND_THEME = {
  BLUE: 'BLUE',
  WHITE: 'WHITE',
};

export const TupaiaBackground = ({ children, theme, style }) => (
  <View behavior="padding" style={[localStyles.container, style]}>
    <LinearGradient
      colors={
        theme === TUPAIA_BACKGROUND_THEME.BLUE
          ? [BACKGROUND_COLOR_TOP, BACKGROUND_COLOR_BOTTOM]
          : [THEME_COLOR_ONE, THEME_COLOR_LIGHT]
      }
      style={[localStyles.container, style]}
    >
      {children}
    </LinearGradient>
  </View>
);

TupaiaBackground.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
  theme: PropTypes.oneOf(Object.values(TUPAIA_BACKGROUND_THEME)),
};

TupaiaBackground.defaultProps = {
  children: null,
  style: {},
  theme: TUPAIA_BACKGROUND_THEME.BLUE,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
