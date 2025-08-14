import React from 'react';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { THEME_COLOR_ONE } from '../globalStyles';

export const getProgressPercentage = (progress, total) =>
  progress >= total ? 100 : (progress / total) * 100;

export const ProgressBar = ({ progress, total, isComplete, style }) => (
  <View style={[localStyles.wrapper, style]}>
    <View
      style={[
        localStyles.inner,
        {
          width: `${isComplete ? 100 : getProgressPercentage(progress, total)}%`,
          opacity: progress < 0 && !isComplete ? 0 : 1,
        },
      ]}
    />
  </View>
);

ProgressBar.propTypes = {
  total: PropTypes.number,
  progress: PropTypes.number,
  isComplete: PropTypes.bool,
  style: ViewPropTypes.style,
};

ProgressBar.defaultProps = {
  total: 0,
  progress: 0,
  isComplete: true, // Fill the progress bar even if total not reached. Useful for errors states.
  style: {},
};

const borderRadius = 13;

const localStyles = StyleSheet.create({
  wrapper: {
    borderRadius,
    borderWidth: 2,
    borderColor: THEME_COLOR_ONE,
    height: 26,
    padding: 1,
  },
  inner: {
    backgroundColor: THEME_COLOR_ONE,
    borderRadius,
    flex: 1,
    minWidth: borderRadius * 2,
  },
});
