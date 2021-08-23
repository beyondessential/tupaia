/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Autocomplete } from '../../autocomplete';
import { registerInputField, inputFieldPropTypes, inputFieldDefaultProps } from '../InputField';

const AutocompleteField = ({
  allowMultipleValues,
  canCreateNewOptions,
  disabled,
  inputKey,
  label,
  onChange,
  optionLabelKey,
  optionsEndpoint,
  optionValueKey,
  parentRecord,
  secondaryLabel,
  value,
}) => (
  <Autocomplete
    placeholder={value}
    label={label}
    helperText={secondaryLabel}
    endpoint={optionsEndpoint}
    optionLabelKey={optionLabelKey}
    optionValueKey={optionValueKey}
    reduxId={inputKey}
    onChange={inputValue => onChange(inputKey, inputValue)}
    canCreateNewOptions={canCreateNewOptions}
    disabled={disabled}
    allowMultipleValues={allowMultipleValues}
    parentRecord={parentRecord}
  />
);

AutocompleteField.propTypes = inputFieldPropTypes;
AutocompleteField.defaultProps = inputFieldDefaultProps;

registerInputField('autocomplete', AutocompleteField);
