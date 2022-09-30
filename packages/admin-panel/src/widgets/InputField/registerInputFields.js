/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
import {
  Button,
  TextField,
  DatePicker,
  DateTimePicker,
  RadioGroup,
  Select,
} from '@tupaia/ui-components';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { registerInputField } from './InputField';
import { Autocomplete } from '../../autocomplete';
import { JsonInputField } from './JsonInputField';
import { JsonEditor } from './JsonEditor';

// "InputField" is treated as a dynamic factory, where different input types can be supported
// depending on what is injected at runtime. This is the standard set of injections, which is the
// current input types on the admin panel.
// The motivation for this pattern is to avoid a dependency cycle where input fields may be nested
// (which is the case for JsonInputFields)

const StyledLink = styled(Link)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

export const registerInputFields = () => {
  registerInputField('autocomplete', props => (
    <Autocomplete
      placeholder={props.value}
      label={props.label}
      helperText={props.secondaryLabel}
      endpoint={props.optionsEndpoint}
      optionLabelKey={props.optionLabelKey}
      optionValueKey={props.optionValueKey}
      reduxId={props.inputKey}
      onChange={inputValue => props.onChange(props.inputKey, inputValue)}
      canCreateNewOptions={props.canCreateNewOptions}
      disabled={props.disabled}
      allowMultipleValues={props.allowMultipleValues}
      parentRecord={props.parentRecord}
      baseFilter={props.baseFilter}
      pageSize={props.pageSize}
    />
  ));
  registerInputField('json', props => (
    <JsonInputField
      label={props.label}
      helperText={props.secondaryLabel}
      value={props.value}
      recordData={props.recordData}
      onChange={inputValue => props.onChange(props.inputKey, inputValue)}
      disabled={props.disabled}
      getJsonFieldSchema={props.getJsonFieldSchema}
      variant={props.variant}
    />
  ));
  registerInputField('enum', props => (
    <Select
      label={props.label}
      helperText={props.secondaryLabel}
      value={props.value || ''}
      options={props.options}
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
    />
  ));
  registerInputField('jsonEditor', props => (
    <JsonEditor
      label={props.label}
      inputKey={props.inputKey}
      value={props.value}
      onChange={props.onChange}
      helperText={props.secondaryLabel}
    />
  ));
  registerInputField('jsonArray', props => (
    <JsonEditor
      label={props.label}
      inputKey={props.inputKey}
      value={props.value}
      onChange={props.onChange}
      helperText={props.secondaryLabel}
      stringify={false}
    />
  ));
  registerInputField('boolean', props => (
    <RadioGroup
      label={props.label}
      onChange={event => props.onChange(props.inputKey, event.target.value === 'true')} // convert to boolean value
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
      value={props.value}
      disabled={props.disabled}
      helperText={props.secondaryLabel}
    />
  ));
  registerInputField('date', props => (
    <DatePicker
      label={props.label}
      helperText={props.secondaryLabel}
      value={props.moment(props.value).isValid() ? moment(props.value) : null}
      onChange={date => props.onChange(props.inputKey, date.toISOString())}
      disabled={props.disabled}
    />
  ));
  registerInputField('datetime-local', props => (
    <DateTimePicker
      label={props.label}
      helperText={props.secondaryLabel}
      format="yyyy-MM-dd HH:mm"
      value={
        props.value && moment(props.value).isValid
          ? moment(props.value).format('YYYY-MM-DDTHH:mm')
          : new Date()
      }
      onChange={date => {
        if (date && moment(date).isValid()) {
          props.onChange(props.inputKey, moment(date).toISOString());
        }
      }}
      disabled={props.disabled}
    />
  ));
  registerInputField('datetime-utc', props => (
    <DateTimePicker
      label={props.label}
      helperText={props.secondaryLabel}
      format="yyyy-MM-dd HH:mm"
      value={
        props.value && moment(props.value).isValid
          ? moment.utc(props.value).format('YYYY-MM-DDTHH:mm')
          : new Date()
      }
      onChange={date => {
        if (date && moment(date).isValid()) {
          props.onChange(props.inputKey, stripTimezoneFromDate(date));
        }
      }}
      disabled={props.disabled}
    />
  ));
  registerInputField('link', props => {
    const { path, parameters = {} } = props.linkOptions;
    let link = path;
    Object.entries(parameters).forEach(([paramKey, recordProperty]) => {
      const linkParam = props.recordData[recordProperty];
      if (linkParam) {
        link = link.replace(`:${paramKey}`, linkParam);
      }
    });
    return (
      <StyledLink to={link}>
        <Button color="primary">{props.label}</Button>
      </StyledLink>
    );
  });
  registerInputField('textarea', props => (
    <TextField
      label={props.label}
      value={props.value || ''}
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      helperText={props.secondaryLabel}
      multiline
      type="textarea"
      rows="4"
    />
  ));
  registerInputField('text', props => (
    <TextField
      label={props.label}
      value={props.value === undefined || props.value === null ? '' : props.value} // we still want to show 0 value
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      helperText={props.secondaryLabel}
      type={props.type}
    />
  ));
};
