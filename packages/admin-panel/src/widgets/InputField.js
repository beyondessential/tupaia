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
  maxHeight,
}) => {
  const inputType = getInputType({ options, optionsEndpoint, type });
  let inputComponent = null;

  switch (inputType) {
    case 'autocomplete':
      inputComponent = (
        <Autocomplete
          placeholder={value}
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
          value={value}
          recordData={recordData}
          onChange={inputValue => onChange(inputKey, inputValue)}
          disabled={disabled}
          getJsonFieldSchema={getJsonFieldSchema}
        />
      );
      break;
    case 'enum':
      inputComponent = (
        <DropDownInputField
          value={value}
          options={options.map(option => ({ label: option, value: option }))}
          onChange={selectedOption => onChange(inputKey, selectedOption)}
          disabled={disabled}
        />
      );
      break;
    case 'jsonEditor':
      inputComponent = (
        <JsonEditor {...{ inputKey, label, value, maxHeight: maxHeight || 100, onChange }} />
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
      {secondaryLabel && (
        <p>
          <i>{secondaryLabel}</i>
        </p>
      )}
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
  recordData: PropTypes.object,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
    PropTypes.bool,
    PropTypes.number,
  ]),
  inputKey: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
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
  maxHeight: PropTypes.number,
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
  maxHeight: undefined,
};
