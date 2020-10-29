/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { BORDER_RADIUS, THEME_COLOR_ONE, THEME_COLOR_TWO, THEME_COLOR_FOUR } from '../globalStyles';
import { Text } from './Text';
import { analytics } from '../utilities';
import { TouchableOpacity } from './Touchable';

export function Button(props) {
  const { disabledStyle, isDisabled, onPress, title, textDisabledStyle, textStyle, style } = props;

  if (isDisabled) {
    return (
      <View style={[localStyles.button, style, disabledStyle]}>
        <Text style={[localStyles.text, textStyle, textDisabledStyle]}>{title}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[localStyles.button, style]}
      activeOpacity={0.6}
      analyticsLabel={title}
      onPress={onPress}
    >
      <Text style={[localStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    textAlign: 'center',
    color: THEME_COLOR_TWO,
  },
  button: {
    width: 180,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: BORDER_RADIUS,
    backgroundColor: THEME_COLOR_ONE,
    alignSelf: 'center',
  },
  disabledButton: {
    backgroundColor: THEME_COLOR_ONE,
  },
  disabledText: {
    color: THEME_COLOR_FOUR,
  },
});

Button.propTypes = {
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  onPress: PropTypes.func,
  title: PropTypes.string,
  isDisabled: PropTypes.bool,
  disabledStyle: ViewPropTypes.style,
  textDisabledStyle: Text.propTypes.style,
};

Button.defaultProps = {
  onPress: () => {},
  title: 'Press Me',
  isDisabled: false,
  disabledStyle: localStyles.disabledButton,
  textDisabledStyle: localStyles.disabledText,
  style: null,
  textStyle: null,
};
