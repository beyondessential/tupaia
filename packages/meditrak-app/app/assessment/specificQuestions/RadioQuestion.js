/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import { Checkbox } from '../../widgets';
import { BORDER_RADIUS, getThemeColorOneFaded, THEME_COLOR_DARK } from '../../globalStyles';

export const RadioQuestion = ({ answer, onChangeAnswer, options, style }) => (
  <View style={[localStyles.wrapper, style]}>
    {options.map(option => {
      const { color: iconColor, label, value } = extractOptionDetails(option); // Sometimes an object with defined color/label/value
      const isSelected = answer === value;
      const checkboxStyle = [localStyles.checkbox, isSelected ? localStyles.checkboxChecked : {}];

      let labelColor;
      // If the icon is a custom colour, make the background white so it is easily visible
      if (iconColor) {
        checkboxStyle.push({ backgroundColor: 'white' }); // Make the background white
        labelColor = THEME_COLOR_DARK; // If the background is white the text should be dark
      }

      return (
        <Checkbox
          key={value}
          labelText={label}
          labelColor={labelColor}
          type="radio"
          isChecked={isSelected}
          onToggle={() => onChangeAnswer(isSelected ? null : value)}
          style={checkboxStyle}
          iconProps={iconColor && { color: iconColor }}
        />
      );
    })}
  </View>
);

RadioQuestion.propTypes = {
  answer: PropTypes.string,
  options: PropTypes.array.isRequired,
  onChangeAnswer: PropTypes.func.isRequired,
  style: ViewPropTypes.style,
};

RadioQuestion.defaultProps = {
  answer: '',
  style: {},
};

const localStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: getThemeColorOneFaded(0.2),
    borderRadius: BORDER_RADIUS,
    marginTop: 8,
  },
  checkbox: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 1, // Both vertical and horizontal required to override default checkbox style.
    marginHorizontal: 1,
  },
  checkboxChecked: {
    marginVertical: 0,
    marginHorizontal: 0,
    backgroundColor: getThemeColorOneFaded(0.2),
    borderWidth: 1,
    borderRadius: BORDER_RADIUS,
    borderColor: getThemeColorOneFaded(0.4),
  },
});

/**
 * Options can either be defined as simple strings, which will be used as both their label and
 * value, or as a string of JSON that separately defines the label and value, and optionally the
 * color it is presented in
 */
const extractOptionDetails = optionString => {
  let optionObject;
  try {
    // If it can be parsed into a JSON object, do so and extract the pre-configured label,
    // value, and optional color
    optionObject = JSON.parse(optionString);
    if (!optionObject.value) {
      // Valid JSON but not a valid option object, e.g. '50'
      throw new Error('Options defined as an object must contain the value key at minimum');
    }
  } catch (error) {
    // This is not a valid JSON object, just use the string itself as the value and label
    optionObject = { value: optionString, label: optionString };
  }
  return optionObject;
};
