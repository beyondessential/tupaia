import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ViewPropTypes } from 'react-native';

import { Text, Icon, TouchableOpacity } from '.';
import {
  getThemeColorOneFaded,
  BORDER_RADIUS,
  THEME_COLOR_ONE,
  BASELINE_FONT_SIZE,
} from '../globalStyles';

export const ProgressActionBar = ({
  label,
  isPreviousEnabled,
  isNextEnabled,
  isTableOfContentsEnabled,
  onPressPrevious,
  onPressNext,
  onPressToc,
  progress,
  style,
}) => (
  <View style={[localStyles.wrapper, style]}>
    <TouchableOpacity
      analyticsLabel="Progress Action Bar: Previous"
      style={localStyles.buttonWrapper}
      onPress={onPressPrevious}
      disabled={!isPreviousEnabled}
    >
      <View style={!isPreviousEnabled ? localStyles.buttonDisabled : {}}>
        <Icon name="angle-left" />
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      analyticsLabel="Progress Action Bar: Table of Contents"
      style={localStyles.progressWrapper}
      onPress={onPressToc}
      disabled={!isTableOfContentsEnabled}
    >
      <Text style={localStyles.label} numberOfLines={1}>
        <Icon name="list" size={BASELINE_FONT_SIZE * 1.3} /> {label}
      </Text>
      <View style={localStyles.progressBar}>
        <View style={[localStyles.progressBarFill, { right: `${(1 - progress) * 100} %` }]} />
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      analyticsLabel="Progress Action Bar: Next"
      style={localStyles.buttonWrapper}
      onPress={onPressNext}
      disabled={!isNextEnabled}
    >
      <View style={!isNextEnabled ? localStyles.buttonDisabled : {}}>
        <Icon name="angle-right" />
      </View>
    </TouchableOpacity>
  </View>
);

ProgressActionBar.propTypes = {
  label: PropTypes.string,
  progress: PropTypes.number,
  style: ViewPropTypes.style,
  isPreviousEnabled: PropTypes.bool,
  isNextEnabled: PropTypes.bool,
  isTableOfContentsEnabled: PropTypes.bool,
  onPressPrevious: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressToc: PropTypes.func,
};

ProgressActionBar.defaultProps = {
  label: '',
  progress: 1,
  style: {},
  onPressNext: () => {},
  onPressPrevious: () => {},
  onPressToc: () => {},
  isNextEnabled: true,
  isPreviousEnabled: true,
  isTableOfContentsEnabled: false,
};

const localStyles = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: 'rgba(48,121,168,0.9)',
    flexDirection: 'row',
  },
  progressWrapper: {
    flex: 1,
    alignSelf: 'center',
  },
  progressBar: {
    position: 'relative',
    borderRadius: BORDER_RADIUS,
    height: 5,
    backgroundColor: getThemeColorOneFaded(0.5),
    width: '100%',
  },
  progressBarFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
    right: '80%',
    backgroundColor: THEME_COLOR_ONE,
  },
  label: {
    fontSize: BASELINE_FONT_SIZE * 1.4,
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  buttonWrapper: {
    width: 70,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonDisabled: {
    opacity: 0.1,
  },
});
