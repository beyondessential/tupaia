/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';

import { Text } from './Text';
import {
  getThemeColorOneFaded,
  BORDER_RADIUS,
  THEME_COLOR_ONE,
  THEME_COLOR_THREE,
  THEME_COLOR_FIVE,
  THEME_TEXT_COLOR_FOUR,
} from '../globalStyles';

export const STATUS_MESSAGE_SUCCESS = 'SUCCESS';
export const STATUS_MESSAGE_ERROR = 'ERROR';
const PRIMARY = 'primary';
const SECONDARY = 'secondary';

export const getMessageIconName = type => {
  switch (type) {
    case STATUS_MESSAGE_SUCCESS:
      return 'checkmark-circle';

    case STATUS_MESSAGE_ERROR:
    default:
      return 'warning';
  }
};

export const getMessageStyle = type => {
  switch (type) {
    case STATUS_MESSAGE_SUCCESS:
      return localStyles.successMessage;

    case STATUS_MESSAGE_ERROR:
    default:
      return localStyles.errorMessage;
  }
};

const getIconStyle = theme => {
  switch (theme) {
    case SECONDARY:
      return iconStyles[SECONDARY];

    case PRIMARY:
    default:
      return iconStyles[PRIMARY];
  }
};

const getTextStyles = theme => {
  switch (theme) {
    case SECONDARY:
      return textStyles[SECONDARY];

    case PRIMARY:
    default:
      return textStyles[PRIMARY];
  }
};

export const StatusMessage = ({ message, style, type, theme }) => (
  <View style={[localStyles.message, getMessageStyle(type), style]}>
    <Icon name={getMessageIconName(type)} style={getIconStyle(theme)} />
    <Text style={getTextStyles(theme)}>{message}</Text>
  </View>
);

StatusMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf([STATUS_MESSAGE_ERROR, STATUS_MESSAGE_SUCCESS]),
  style: ViewPropTypes.style,
  theme: PropTypes.string,
};

StatusMessage.defaultProps = {
  message: '',
  type: STATUS_MESSAGE_ERROR,
  style: null,
  theme: PRIMARY,
};

const localStyles = StyleSheet.create({
  message: {
    padding: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: getThemeColorOneFaded(0.3),
  },
  errorMessage: {
    backgroundColor: THEME_COLOR_THREE,
  },
  successMessage: {
    backgroundColor: THEME_COLOR_FIVE,
  },
});

const baseIconStyles = { marginRight: 10, marginVertical: 3 };
const iconStyles = StyleSheet.create({
  [PRIMARY]: {
    ...baseIconStyles,
    fontSize: 14,
    color: 'white',
  },
  [SECONDARY]: { ...baseIconStyles, fontSize: 26, color: '#32B032' },
});

const baseTextStyles = { flex: 1 };
const textStyles = StyleSheet.create({
  [PRIMARY]: { ...baseTextStyles, color: THEME_COLOR_ONE },
  [SECONDARY]: { ...baseTextStyles, color: THEME_TEXT_COLOR_FOUR, fontWeight: '500' },
});
