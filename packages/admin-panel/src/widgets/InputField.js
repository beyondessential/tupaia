/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input } from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { Autocomplete } from '../autocomplete';
import { JsonInputField } from './JsonInputField';
import { DropDownInputField } from './DropDownInputField';

export const InputField = ({
  allowMultipleValues,
  label,
  value,
  inputKey,
  optionsEndpoint,
  optionLabelKey,
  optionValueKey,
  onChange,
  type,
  canCreateNewOptions,
  disabled,
  getJsonFieldSchema,
}) => {
  const inputType = optionsEndpoint ? 'autocomplete' : type;
  let inputComponent = null;

  switch (inputType) {
    case 'autocomplete':
      inputComponent = (
        <Autocomplete
          placeholder={value}
          endpoint={optionsEndpoint}
          optionLabelKey={optionLabelKey}
          reduxId={inputKey}
          onChange={selection =>
            onChange(
              inputKey,
              allowMultipleValues
                ? selection.map(s => s[optionValueKey])
                : selection[optionValueKey],
            )
          }
          canCreateNewOptions={canCreateNewOptions}
          disabled={disabled}
          allowMultipleValues={allowMultipleValues}
        />
      );
      break;
    case 'json':
      inputComponent = (
        <JsonInputField
          value={value}
          onChange={inputValue => onChange(inputKey, inputValue)}
          disabled={disabled}
          getJsonFieldSchema={getJsonFieldSchema}
        />
      );
      break;
    case 'boolean':
      inputComponent = (
        <DropDownInputField
          value={value}
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
          onChange={selectedOption => onChange(inputKey, selectedOption)}
          disabled={disabled}
        />
      );
      break;
    case 'date':
      inputComponent = (
        <DatePicker
          selected={moment(value).isValid() ? moment(value) : null}
          onChange={date => onChange(inputKey, date.toISOString())}
          disabled={disabled}
        />
      );
      break;
    default:
      inputComponent = (
        <Input
          value={processValue(value, type) || ''}
          onChange={event => onChange(inputKey, event.target.value)}
          disabled={disabled}
          type={type}
        />
      );
      break;
  }

  return (
    <FormGroup>
      <p>{label}</p>
      {inputComponent}
    </FormGroup>
  );
};

const processValue = (value, type) => {
  if (type === 'datetime-local') {
    const formattedDateString =
      value && moment(value).isValid ? moment(value).format('YYYY-MM-DDTHH:mm') : '';
    return formattedDateString;
  }

  return value;
};

InputField.propTypes = {
  allowMultipleValues: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.bool]),
  inputKey: PropTypes.string.isRequired,
  optionsEndpoint: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  optionLabelKey: PropTypes.string,
  optionValueKey: PropTypes.string,
  canCreateNewOptions: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  getJsonFieldSchema: PropTypes.func,
};

InputField.defaultProps = {
  allowMultipleValues: false,
  value: null,
  optionsEndpoint: null,
  optionLabelKey: 'name',
  optionValueKey: 'id',
  canCreateNewOptions: false,
  disabled: false,
  type: 'text',
  getJsonFieldSchema: () => [],
};
