import React from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from '../Text';
import { localStyles, getMessageStyle, getIconStyle, getTextStyles } from './styles';
import { PRIMARY, STATUS_MESSAGE_ERROR, STATUS_MESSAGE_SUCCESS } from './constants';

const getMessageIconName = type => {
  switch (type) {
    case STATUS_MESSAGE_SUCCESS:
      return 'checkmark-circle';

    case STATUS_MESSAGE_ERROR:
    default:
      return 'warning';
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
