/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from '.';
import { BORDER_RADIUS } from '../globalStyles';

export const MultilineTextInput = props => (
  <TextInput
    multiline
    wrapperStyle={localStyles.wrapper}
    inputWrapperStyle={localStyles.inputWrapper}
    errorStyle={localStyles.errorIcon}
    style={localStyles.input}
    {...props}
  />
);

const localStyles = StyleSheet.create({
  wrapper: {
    marginTop: 15,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 50, // this creates some padding between the label and the element above it
  },
  input: {
    height: 200,
    textAlignVertical: 'top',
  },
  errorIcon: {
    top: 40, // Align with first line of label.
  },
});
