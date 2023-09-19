/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Image, StyleSheet, Text, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import { TouchableOpacity } from './Touchable';
import {
  THEME_COLOR_ONE,
  DEFAULT_PADDING,
  getGreyShade,
  BORDER_RADIUS,
  THEME_COLOR_TWO,
} from '../globalStyles';

export const MenuItem = ({ imageSource, onPress, width, height, text, style }) => (
  <TouchableOpacity
    analyticsLabel={`Menu Item: ${text}`}
    onPress={onPress}
    style={[localStyles.wrapper, style]}
    activeOpacity={0.8}
  >
    {imageSource ? (
      <Image
        source={imageSource}
        style={[
          localStyles.image,
          {
            width: width / 2,
            height: height / 2,
          },
        ]}
      />
    ) : null}
    <Text style={localStyles.text}>{text}</Text>
  </TouchableOpacity>
);

MenuItem.propTypes = {
  imageSource: PropTypes.any,
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  style: ViewPropTypes.style,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

MenuItem.defaultProps = {
  style: null,
  textStyle: null,
  imageSource: null,
};

const localStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS * 2,
    backgroundColor: THEME_COLOR_TWO,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: getGreyShade(0.8),
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLOR_ONE,
  },
  image: {
    zIndex: 0,
    marginTop: DEFAULT_PADDING,
    borderRadius: BORDER_RADIUS,
    padding: 5,
  },
  text: {
    color: THEME_COLOR_ONE,
    position: 'relative',
    zIndex: 1,
    fontWeight: 'bold',
    padding: DEFAULT_PADDING,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
