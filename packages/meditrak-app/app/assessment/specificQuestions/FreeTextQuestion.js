/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { Icon, TextInput } from '../../widgets';

import {
  THEME_FONT_FAMILY,
  THEME_TEXT_COLOR_ONE,
  getThemeColorOneFaded,
  THEME_FONT_SIZE_ONE,
} from '../../globalStyles';

export class FreeTextQuestion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
    };
  }

  onFocus() {
    this.props.onFocus();

    this.setState({
      isFocused: true,
    });
  }

  onBlur() {
    this.setState({
      isFocused: false,
    });
  }

  render() {
    const { answer, onChangeAnswer, textInputProps } = this.props;

    const { onSubmitEditing, ...restOfTextInputProps } = textInputProps;

    const { isFocused } = this.state;

    return (
      <View style={[localStyles.wrapper, isFocused ? localStyles.wrapperFocussed : {}]}>
        <TextInput
          placeholder="Type your answer here"
          style={[localStyles.textInput, Platform.OS === 'ios' && localStyles.textInputFixedHeight]}
          value={answer}
          selectTextOnFocus
          onFocus={() => this.onFocus()}
          onBlur={() => this.onBlur()}
          onSubmitEditing={onSubmitEditing}
          onChangeText={onChangeAnswer}
          placeholderTextColor={getThemeColorOneFaded(0.7)}
          {...restOfTextInputProps}
        />
        <Icon name="pencil" size={14} style={localStyles.icon} pointerEvents="none" />
      </View>
    );
  }
}

FreeTextQuestion.propTypes = {
  answer: PropTypes.string,
  onChangeAnswer: PropTypes.func.isRequired,
  textInputProps: PropTypes.object,
  onFocus: PropTypes.func,
};

FreeTextQuestion.defaultProps = {
  answer: '',
  textInputProps: {},
  onFocus: () => {},
};

const localStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: getThemeColorOneFaded(0.2),
  },
  wrapperFocussed: {
    borderBottomColor: getThemeColorOneFaded(0.8),
  },
  textInput: {
    color: THEME_TEXT_COLOR_ONE,
    fontFamily: THEME_FONT_FAMILY,
    fontSize: THEME_FONT_SIZE_ONE,
    paddingVertical: 10,
  },
  textInputFixedHeight: {
    height: 40,
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});
