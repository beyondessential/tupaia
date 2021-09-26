/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

const InputFieldComponents = {};

export const registerInputField = (type, Component) => {
  InputFieldComponents[type] = Component;
};

const getInputType = ({ options, optionsEndpoint, type }) => {
  if (options) {
    return 'enum';
  }
  if (optionsEndpoint) {
    return 'autocomplete';
  }
  return type;
};

export const InputField = ({ type, ...inputProps }) => {
  const { options, optionsEndpoint } = inputProps;
  const inputType = getInputType({ options, optionsEndpoint, type });
  const InputComponent = InputFieldComponents[inputType];
  return <InputComponent {...inputProps} />;
};

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
  optionLabelKey: PropTypes.string,
  optionValueKey: PropTypes.string,
  canCreateNewOptions: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  getJsonFieldSchema: PropTypes.func,
  parentRecord: PropTypes.object,
  secondaryLabel: PropTypes.string,
  variant: PropTypes.string,
};

export const inputFieldDefaultProps = {
  allowMultipleValues: false,
  value: null,
  recordData: {},
  options: null,
  optionsEndpoint: null,
  optionLabelKey: 'name',
  optionValueKey: 'id',
  canCreateNewOptions: false,
  disabled: false,
  type: 'text',
  getJsonFieldSchema: () => [],
  parentRecord: {},
  secondaryLabel: null,
  variant: null,
};

InputField.propTypes = inputFieldPropTypes;
InputField.defaultProps = inputFieldDefaultProps;
