/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput as RNTextInput, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { THEME_COLOR_ONE, THEME_TEXT_COLOR_ONE, THEME_FONT_SIZE_ONE } from '../globalStyles';
import { MultilineTextInput } from '.';

const getLabelStyle = (fieldValue, isMultiline) => {
  const style = [localStyles.label];

  if (isMultiline) {
    style.push(localStyles.labelMultiline);
  } else if (fieldValue !== '') {
    style.push(localStyles.labelAbove);
  }

  return style;
};

const getLabelTextStyle = (fieldValue, isMultiline) => {
  const style = [localStyles.labelText];

  if (fieldValue !== '' && !isMultiline) {
    style.push(localStyles.labelTextAbove);
  }

  return style;
};

export const TextInput = ({
  inputRef,
  label,
  wrapperStyle,
  inputWrapperStyle,
  errorStyle,
  value,
  style,
  hasError,
  onChange,
  multiline,
  ...restOfProps
}) => {
  if (label === '') {
    return (
      <RNTextInput
        multiline={multiline}
        ref={inputRef}
        autoCapitalize="none"
        autoCorrect={false}
        onChange={onChange}
        style={style}
        value={value}
        {...restOfProps}
      />
    );
  }

  const textInputStyles = [localStyles.input, style];
  const wrapperStyles = [localStyles.wrapper, wrapperStyle];
  const inputWrapperStyles = [localStyles.inputWrapper, inputWrapperStyle];
  const errorStyles = [localStyles.errorIcon, errorStyle];

  return (
    <View style={wrapperStyles}>
      <View style={inputWrapperStyles}>
        <RNTextInput
          multiline={multiline}
          ref={inputRef}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChange}
          value={value}
          style={textInputStyles}
          {...restOfProps}
        />
      </View>
      {hasError ? (
        <Icon name="exclamation-triangle" style={errorStyles} color={THEME_COLOR_ONE} />
      ) : null}
      <View pointerEvents="none" style={getLabelStyle(value, multiline)}>
        <Text style={getLabelTextStyle(value, multiline)}>{label}</Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 15,
  },
  inputWrapper: {
    borderBottomWidth: 1,
    borderColor: THEME_COLOR_ONE,
  },
  label: {
    position: 'absolute',
    top: 21,
    left: 0,
    height: 30,
    opacity: 0.9,
  },
  labelAbove: {
    top: 0,
    left: 0,
  },
  labelMultiline: {
    top: 31,
  },
  labelText: {
    color: THEME_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  labelTextAbove: {
    fontSize: 12,
  },
  input: {
    height: 32,
    padding: 0,
    color: THEME_COLOR_ONE,
    fontSize: THEME_FONT_SIZE_ONE,
  },
  errorIcon: {
    position: 'absolute',
    bottom: 10,
    right: 0,
  },
});

TextInput.propTypes = {
  inputRef: PropTypes.func,
  label: PropTypes.string,
  wrapperStyle: ViewPropTypes.style,
  inputWrapperStyle: ViewPropTypes.style,
  errorStyle: ViewPropTypes.style,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  style: RNTextInput.propTypes.style,
  hasError: PropTypes.bool,
  multiline: PropTypes.bool,
};

TextInput.defaultProps = {
  inputRef: null,
  label: '',
  defaultValue: '',
  wrapperStyle: {},
  inputWrapperStyle: {},
  errorStyle: {},
  onChange: () => {},
  value: '',
  style: null,
  hasError: false,
  multiline: false,
  selectionColor: THEME_COLOR_ONE,
};
