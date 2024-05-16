/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { InputWrapper } from './InputWrapper';
import { getEditorState } from '../../editor/selectors';

const InputFieldComponents = {};

export const registerInputField = (type, Component) => {
  InputFieldComponents[type] = Component;
};

const getInputType = ({ options, optionsEndpoint, type }) => {
  if (options && type !== 'radio') {
    return 'enum';
  }
  if (optionsEndpoint) {
    return 'autocomplete';
  }
  return type;
};

export const InputFieldComponent = ({ type, secondaryLabel, error, ...inputProps }) => {
  const { options, optionsEndpoint } = inputProps;
  const inputType = getInputType({ options, optionsEndpoint, type });
  const InputComponent = InputFieldComponents[inputType];
  return (
    <InputWrapper errorText={error} helperText={secondaryLabel}>
      {InputComponent && <InputComponent {...inputProps} invalid={!!error} />}
    </InputWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { inputKey } = ownProps;
  const editorState = getEditorState(state);
  return {
    error: editorState.validationErrors[inputKey],
  };
};

export const InputField = connect(mapStateToProps)(InputFieldComponent);

export const inputFieldPropTypes = {
  allowMultipleValues: PropTypes.bool,
  label: PropTypes.string.isRequired,
  recordData: PropTypes.object,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
    PropTypes.bool,
    PropTypes.number,
  ]),
  inputKey: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object),
  optionsEndpoint: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSetFormFile: PropTypes.func,
  optionLabelKey: PropTypes.string,
  optionValueKey: PropTypes.string,
  canCreateNewOptions: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  getJsonFieldSchema: PropTypes.func,
  parentRecord: PropTypes.object,
  secondaryLabel: PropTypes.string,
  variant: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
};

export const inputFieldDefaultProps = {
  allowMultipleValues: false,
  value: null,
  recordData: {},
  options: null,
  optionsEndpoint: null,
  onSetFormFile: () => {},
  optionLabelKey: 'name',
  optionValueKey: 'id',
  canCreateNewOptions: false,
  disabled: false,
  type: 'text',
  getJsonFieldSchema: () => [],
  parentRecord: {},
  secondaryLabel: null,
  variant: null,
  required: false,
  error: null,
};

InputFieldComponent.propTypes = inputFieldPropTypes;
InputFieldComponent.defaultProps = inputFieldDefaultProps;
