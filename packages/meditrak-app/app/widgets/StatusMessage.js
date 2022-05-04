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
} from '../globalStyles';

export const STATUS_MESSAGE_SUCCESS = 'SUCCESS';
export const STATUS_MESSAGE_ERROR = 'ERROR';

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

export const StatusMessage = ({ message, style, type, textStyle, iconStyle }) => (
  <View style={[localStyles.message, getMessageStyle(type), style]}>
    <Icon name={getMessageIconName(type)} style={StyleSheet.compose(localStyles.icon, iconStyle)} />
    <Text style={[localStyles.messageText, textStyle]}>{message}</Text>
  </View>
);

StatusMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf([STATUS_MESSAGE_ERROR, STATUS_MESSAGE_SUCCESS]),
  style: ViewPropTypes.style,
  textStyle: ViewPropTypes.style,
  iconStyle: ViewPropTypes.style,
};

StatusMessage.defaultProps = {
  message: '',
  type: STATUS_MESSAGE_ERROR,
  style: null,
  textStyle: null,
  iconStyle: null,
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
  messageText: {
    color: THEME_COLOR_ONE,
    flex: 1,
  },
  icon: {
    marginRight: 10,
    marginVertical: 3,
    fontSize: 14,
    color: 'white',
  },
});
