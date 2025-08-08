import React from 'react';
import PropTypes from 'prop-types';
import { InputWrapper } from './InputWrapper';

const InputFields = {};

export const registerInputField = (type, Component) => {
  InputFields[type] = Component;
};

const getInputType = ({ options, optionsEndpoint, type }) => {
  if (options && type !== 'radio') {
    return 'enum';
  }
  if (optionsEndpoint && type !== 'checkboxList') {
    return 'autocomplete';
  }
  return type;
};

export const InputField = ({
  type,
  maxLength,
  minLength,
  secondaryLabel,
  error,
  ...inputProps
}) => {
  const { options, optionsEndpoint } = inputProps;
  const inputType = getInputType({ options, optionsEndpoint, type });
  const InputComponent = InputFields[inputType];

  const generateHelperText = () => {
    if (secondaryLabel) return secondaryLabel;
    if (maxLength && minLength !== undefined && minLength !== null) {
      return `Must be between ${minLength} and ${maxLength} characters`;
    }

    if (maxLength) {
      return `Max ${maxLength} characters`;
    }

    if (minLength !== undefined && minLength !== null) {
      return `Min ${minLength} characters`;
    }
  };

  const helperText = generateHelperText();

  return (
    <InputWrapper errorText={error} helperText={helperText}>
      {InputComponent && (
        <InputComponent
          {...inputProps}
          error={!!error}
          maxLength={maxLength}
          minLength={minLength}
        />
      )}
    </InputWrapper>
  );
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
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
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
  maxLength: null,
  minLength: null,
};

InputField.propTypes = inputFieldPropTypes;
InputField.defaultProps = inputFieldDefaultProps;
