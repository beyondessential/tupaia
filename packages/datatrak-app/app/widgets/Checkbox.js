/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME_TEXT_COLOR_ONE, THEME_FONT_FAMILY, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { Text } from './Text';
import { TouchableOpacity } from './Touchable';

const ICON_NAMES = {
  checkbox: {
    checked: 'check-box',
    unchecked: 'check-box-outline-blank',
  },
  radio: {
    checked: 'radio-button-checked',
    unchecked: 'radio-button-unchecked',
  },
};

export const Checkbox = ({
  isChecked,
  type,
  labelSide,
  labelText,
  labelColor,
  iconProps,
  style,
  onToggle,
}) => {
  let label;
  let extraContainerStyle;
  let extraIconStyle;
  if (labelText) {
    label = (
      <View style={localStyles.textContainer}>
        <Text style={[isChecked && localStyles.checkedLabel, labelColor && { color: labelColor }]}>
          {labelText}
        </Text>
      </View>
    );
    extraContainerStyle = labelSide === 'left' ? localStyles.leftLabelContainer : {};
    extraIconStyle = labelSide === 'left' ? localStyles.rightIcon : localStyles.leftIcon;
  }
  const iconName = ICON_NAMES[type][isChecked ? 'checked' : 'unchecked'];
  return (
    <TouchableOpacity
      analyticsLabel={`Checkbox: ${label}`}
      onPress={onToggle}
      style={[localStyles.container, extraContainerStyle, style]}
    >
      {labelSide === 'left' && label}
      <Icon
        name={iconName}
        style={[localStyles.text, localStyles.icon, extraIconStyle]}
        color={THEME_TEXT_COLOR_ONE}
        {...iconProps}
      />
      {labelSide === 'right' && label}
    </TouchableOpacity>
  );
};

Checkbox.propTypes = {
  onToggle: PropTypes.func,
  isChecked: PropTypes.bool,
  type: PropTypes.oneOf(['checkbox', 'radio']),
  labelSide: PropTypes.oneOf(['left', 'right']),
  labelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  labelColor: PropTypes.string,
  iconProps: PropTypes.object,
  style: ViewPropTypes.style,
};

Checkbox.defaultProps = {
  onToggle: null,
  isChecked: false,
  labelSide: 'right',
  labelText: '',
  labelColor: undefined,
  iconProps: {},
  type: 'checkbox',
  labelElement: null,
  style: {},
};

const ICON_MARGIN = 10;
const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 5,
  },
  icon: {
    fontSize: THEME_FONT_SIZE_ONE * 1.8,
    fontFamily: THEME_FONT_FAMILY,
  },
  leftIcon: {
    marginRight: ICON_MARGIN,
    left: -3, // Compensate for icon not lining up to side of screen.
  },
  rightIcon: {
    marginLeft: ICON_MARGIN,
    right: -3, // Compensate for icon not lining up to side of screen.
  },
  leftLabelContainer: {
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  checkedLabel: {
    fontWeight: 'bold',
  },
});
