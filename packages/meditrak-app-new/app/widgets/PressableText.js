/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import { TouchableOpacity } from './Touchable';
import { Text } from './index';

export const PressableText = ({ children, onPress, style }) => (
  <TouchableOpacity analyticsLabel="Pressable Text" onPress={onPress} style={style}>
    <Text>{children}</Text>
  </TouchableOpacity>
);

PressableText.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  style: ViewPropTypes.style,
};

PressableText.defaultProps = {
  onPress: null,
  style: {},
};
