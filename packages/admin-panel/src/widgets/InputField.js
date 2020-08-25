/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { TextField, DatePicker, DateTimePicker, RadioGroup, Select } from '@tupaia/ui-components';
import { Autocomplete } from '../autocomplete';
import { JsonInputField } from './JsonInputField';
import { JsonEditor } from './JsonEditor';

const getInputType = ({ options, optionsEndpoint, type }) => {
  if (options) {
    return 'enum';
  }
  if (optionsEndpoint) {
    return 'autocomplete';
  }
  return type;
};

export const InputField = ({
  allowMultipleValues,
  label,
  secondaryLabel,
  value,
  recordData,
  inputKey,
  options,
  optionsEndpoint,
  optionLabelKey,
  optionValueKey,
  onChange,
  type,
  canCreateNewOptions,
  disabled,
  getJsonFieldSchema,
  parentRecord,
  variant,
}) => {
  const inputType = getInputType({ options, optionsEndpoint, type });
  let inputComponent = null;

  switch (inputType) {
    case 'autocomplete':
      inputComponent = (
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
      break;
    case 'json':
      inputComponent = (
        <JsonInputField
          label={label}
          helperText={secondaryLabel}
          value={value}
          recordData={recordData}
          onChange={inputValue => onChange(inputKey, inputValue)}
          disabled={disabled}
          getJsonFieldSchema={getJsonFieldSchema}
          variant={variant}
        />
      );
      break;
    case 'enum':
      inputComponent = (
        <Select
          label={label}
          helperText={secondaryLabel}
          value={value}
          options={options}
          onChange={event => onChange(inputKey, event.target.value)}
          disabled={disabled}
        />
      );
      break;
    case 'jsonEditor':
      inputComponent = (
        <JsonEditor
          label={label}
          inputKey={inputKey}
          value={value}
          onChange={onChange}
          helperText={secondaryLabel}
        />
      );
      break;
    case 'boolean':
      inputComponent = (
        <RadioGroup
          label={label}
          onChange={event => onChange(inputKey, event.target.value === 'true')} // convert to boolean value
          options={[
            {
              label: 'Yes',
              value: true,
            },
            {
              label: 'No',
              value: false,
            },
          ]}
          value={value}
          disabled={disabled}
          helperText={secondaryLabel}
        />
      );
      break;
    case 'date':
      inputComponent = (
        <DatePicker
          label={label}
          helperText={secondaryLabel}
          value={moment(value).isValid() ? moment(value) : null}
          onChange={date => onChange(inputKey, date.toISOString())}
          disabled={disabled}
        />
      );
      break;
    case 'datetime-local':
      inputComponent = (
        <DateTimePicker
          label={label}
          helperText={secondaryLabel}
          format="yyyy-MM-dd HH:mm"
          value={
            value && moment(value).isValid ? moment(value).format('YYYY-MM-DDTHH:mm') : new Date()
          }
          onChange={date => {
            if (date && moment(date).isValid()) {
              onChange(inputKey, moment(date).toISOString());
            }
          }}
          disabled={disabled}
        />
      );
      break;
    case 'textarea':
      inputComponent = (
        <TextField
          label={label}
          value={value || ''}
          onChange={event => onChange(inputKey, event.target.value)}
          disabled={disabled}
          helperText={secondaryLabel}
          multiline
          type="textarea"
          rows="4"
        />
      );
      break;
    default:
      inputComponent = (
        <TextField
          label={label}
          value={value || ''}
          onChange={event => onChange(inputKey, event.target.value)}
          disabled={disabled}
          helperText={secondaryLabel}
          type={type}
        />
      );
      break;
  }

  return inputComponent;
};

InputField.propTypes = {
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

InputField.defaultProps = {
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
