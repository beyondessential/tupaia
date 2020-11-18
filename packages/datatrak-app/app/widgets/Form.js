/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

import { THEME_FONT_SIZE_THREE } from '../globalStyles';

import { Button, Checkbox, TextInput, MultilineTextInput } from '.';

export const FIELD_TYPES = {
  TEXT: 'TEXT',
  MULTILINE: 'MULTILINE',
  SELECT: 'SELECT',
  BUTTON: 'BUTTON',
  CHECKBOX: 'CHECKBOX',
};

export class Form extends Component {
  constructor(props) {
    super(props);

    this.inputRefs = [];
    this.inputRefKeys = [];
  }

  onTextInputSubmitEditing(inputKey) {
    const inputIndex = this.inputRefKeys.indexOf(inputKey);
    const inputCount = this.inputRefs.length;
    if (inputIndex < inputCount - 1) {
      const nextInput = this.inputRefs[inputIndex + 1];
      nextInput.focus();
    }
  }

  setTextFieldInputRef(reference, inputKey) {
    // React calls first ref with a null value https://github.com/facebook/react/pull/8707 (sometimes)
    if (reference !== null) {
      this.inputRefKeys.push(inputKey);
      this.inputRefs.push(reference);
    }
  }

  getFieldElement(field, value, onFieldChange, isValid = true) {
    const style = [localStyles.formInput];
    const { fieldStyle, type, key, ...fieldProps } = field;

    if (fieldStyle) {
      style.push(fieldStyle);
    }

    switch (type) {
      case FIELD_TYPES.CHECKBOX:
        return (
          <View key={key} style={style}>
            <Checkbox
              {...fieldProps}
              labelText={fieldProps.label}
              labelSide="right"
              onToggle={() => onFieldChange(key, !value)}
              style={localStyles.checkbox}
              isChecked={value}
            />
          </View>
        );

      case FIELD_TYPES.BUTTON:
        return (
          <Button
            title={fieldProps.label}
            style={style}
            key={key}
            onPress={() => onFieldChange(key, true)}
          />
        );

      case FIELD_TYPES.MULTILINE:
        return (
          <MultilineTextInput
            {...fieldProps}
            key={key}
            wrapperStyle={style}
            onChange={newValue => onFieldChange(key, newValue)}
            hasError={!isValid}
            value={value}
            inputRef={reference => this.setTextFieldInputRef(reference, key)}
            onSubmitEditing={() => this.onTextInputSubmitEditing(key)}
          />
        );

      case FIELD_TYPES.TEXT:
      default:
        return (
          <TextInput
            {...fieldProps}
            key={key}
            wrapperStyle={style}
            onChange={newValue => onFieldChange(key, newValue)}
            hasError={!isValid}
            value={value}
            inputRef={reference => this.setTextFieldInputRef(reference, key)}
            onSubmitEditing={() => this.onTextInputSubmitEditing(key)}
          />
        );
    }
  }

  fieldIsValid(fieldKey) {
    return !this.props.invalidFields.includes(fieldKey);
  }

  render() {
    // Dispose of stale references.
    this.inputRefs = [];
    this.inputRefKeys = [];

    const { fields, fieldValues, onFieldChange, style } = this.props;

    return (
      <View style={[localStyles.formFields, style]}>
        {fields.map(field =>
          this.getFieldElement(
            field,
            fieldValues[field.key],
            onFieldChange,
            this.fieldIsValid(field.key),
          ),
        )}
      </View>
    );
  }
}

Form.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
      key: PropTypes.string,
      type: PropTypes.oneOf(Object.keys(FIELD_TYPES)),
      keyboardType: PropTypes.string,
      fieldStyle: ViewPropTypes.style,
    }),
  ),
  fieldValues: PropTypes.object,
  onFieldChange: PropTypes.func,
  style: ViewPropTypes.style,
  invalidFields: PropTypes.array,
};

Form.defaultProps = {
  fields: [],
  onFieldChange: () => {},
  style: null,
  fieldValues: {},
  invalidFields: [],
};

const localStyles = StyleSheet.create({
  formFields: {
    flex: 1,
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formInput: {
    marginBottom: 10,
    width: '100%',
    maxWidth: '100%', // Necessary to prevent width overflow.
  },
  headerText: {
    fontSize: THEME_FONT_SIZE_THREE,
    width: '100%',
    textAlign: 'center',
    paddingBottom: 20,
  },
  checkbox: {
    width: '97%', // Fix nasty checkbox alignment issues.
  },
});
