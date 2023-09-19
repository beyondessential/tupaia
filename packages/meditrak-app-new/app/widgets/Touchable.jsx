/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  TouchableOpacity as rnTouchableOpacity,
  TouchableHighlight as rnTouchableHighlight,
  TouchableWithoutFeedback as rnTouchableWithoutFeedback,
} from 'react-native';
import { analytics } from '../utilities/analytics';

const withAnalytics = WrappedComponent => props => {
  const { onPress, analyticsLabel, ...restOfProps } = props;

  let onPressLogged;
  if (onPress) {
    if (!analyticsLabel && __DEV__) {
      console.warn('No analytics label');
    }
    onPressLogged = e => {
      analytics.trackButtonPress(analyticsLabel);
      return onPress(e);
    };
  }

  return <WrappedComponent activeOpacity={0.7} {...restOfProps} onPress={onPressLogged} />;
};

export const TouchableOpacity = withAnalytics(rnTouchableOpacity);
export const TouchableHighlight = withAnalytics(rnTouchableHighlight);
export const TouchableWithoutFeedback = withAnalytics(rnTouchableWithoutFeedback);
