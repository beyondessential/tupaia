import React from 'react';
import {
  TouchableOpacity as rnTouchableOpacity,
  TouchableHighlight as rnTouchableHighlight,
  TouchableWithoutFeedback as rnTouchableWithoutFeedback,
} from 'react-native';

const withDefaultActiveOpacity = WrappedComponent => props => (
  <WrappedComponent activeOpacity={0.7} {...props} />
);

export const TouchableOpacity = withDefaultActiveOpacity(rnTouchableOpacity);
export const TouchableHighlight = withDefaultActiveOpacity(rnTouchableHighlight);
export const TouchableWithoutFeedback = withDefaultActiveOpacity(rnTouchableWithoutFeedback);
