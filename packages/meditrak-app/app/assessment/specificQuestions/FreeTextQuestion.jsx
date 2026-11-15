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

    // The input renders from local state rather than straight from the Redux answer. If the value
    // reaching the native input lags a keystroke behind, Android rewrites the whole text and the
    // cursor drifts back one character when editing mid-text.
    this.state = {
      isFocused: false,
      text: props.answer ?? '',
    };
    this.lastEmittedAnswer = props.answer;
  }

  componentDidUpdate(prevProps) {
    const { answer } = this.props;
    // Pick up answers changed from outside this input (e.g. survey reset), but not our own echoes
    if (answer !== prevProps.answer && answer !== this.lastEmittedAnswer) {
      this.lastEmittedAnswer = answer;
      this.setState({ text: answer ?? '' });
    }
  }

  onChangeText(text) {
    this.lastEmittedAnswer = text;
    this.setState({ text });
    this.props.onChangeAnswer(text);
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
    const { textInputProps } = this.props;

    const { onSubmitEditing, ...restOfTextInputProps } = textInputProps;

    const { isFocused, text } = this.state;

    return (
      <View style={[localStyles.wrapper, isFocused ? localStyles.wrapperFocussed : {}]}>
        <TextInput
          placeholder="Type your answer here"
          style={[localStyles.textInput, Platform.OS === 'ios' && localStyles.textInputFixedHeight]}
          value={text}
          selectTextOnFocus
          onFocus={() => this.onFocus()}
          onBlur={() => this.onBlur()}
          onSubmitEditing={onSubmitEditing}
          onChangeText={newText => this.onChangeText(newText)}
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
