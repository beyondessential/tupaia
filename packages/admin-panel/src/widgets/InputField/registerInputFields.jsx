/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { InputAdornment } from '@material-ui/core';
import styled from 'styled-components';
import {
  Button,
  TextField,
  DatePicker,
  DateTimePicker,
  RadioGroup,
  Select,
  ImageUploadField,
  HexcodeField,
  Checkbox,
} from '@tupaia/ui-components';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { registerInputField } from './InputField';
import { ReduxAutocomplete } from '../../autocomplete';
import { JsonInputField } from './JsonInputField';
import { JsonEditor } from './JsonEditor';
import { FileUploadField } from './FileUploadField';
import { CheckboxListField } from './CheckboxListField';
import { CheckboxUncheckedIcon } from '../Checkbox/CheckboxUncheckedIcon';
import { CheckboxCheckedIcon } from '../Checkbox/CheckboxCheckedIcon';

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

// Handle styling of the checkbox for just the admin-panel so as not to overwrite styles of the checkbox used elsewhere
export const StyledCheckboxWrapper = styled.div`
  .MuiFormControlLabel-label {
    font-size: 0.975rem;
    color: ${props => props.theme.palette.text.secondary};
  }
  .MuiButtonBase-root:not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.secondary};
  }
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-inputMultiline {
    padding: 1rem;
  }
`;

export const registerInputFields = () => {
  registerInputField('autocomplete', props => (
    <ReduxAutocomplete
      id={props.id}
      placeholder={props.value}
      initialValue={props.value}
      label={props.label}
      endpoint={props.optionsEndpoint}
      optionLabelKey={props.optionLabelKey}
      optionValueKey={props.optionValueKey}
      optionFields={props.optionFields}
      renderOption={props.renderOption}
      reduxId={props.inputKey}
      onChange={inputValue => props.onChange(props.inputKey, inputValue)}
      canCreateNewOptions={props.canCreateNewOptions}
      disabled={props.disabled}
      allowMultipleValues={props.allowMultipleValues}
      parentRecord={props.parentRecord}
      baseFilter={props.baseFilter}
      pageSize={props.pageSize}
      tooltip={props.labelTooltip}
      distinct={props.distinct}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('checkboxList', props => (
    <CheckboxListField
      id={props.id}
      placeholder={props.value}
      value={props.value}
      label={props.label}
      helperText={props.secondaryLabel}
      endpoint={props.optionsEndpoint}
      optionLabelKey={props.optionLabelKey}
      optionValueKey={props.optionValueKey}
      reduxId={props.inputKey}
      onChange={inputValue => props.onChange(props.inputKey, inputValue)}
      disabled={props.disabled}
      baseFilter={props.baseFilter}
      pageSize={props.pageSize}
      tooltip={props.labelTooltip}
      distinct={props.distinct}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('json', props => (
    <JsonInputField
      id={props.id}
      label={props.label}
      value={props.value}
      recordData={props.recordData}
      onChange={inputValue => props.onChange(props.inputKey, inputValue)}
      disabled={props.disabled}
      getJsonFieldSchema={props.getJsonFieldSchema}
      variant={props.variant}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('enum', props => (
    <Select
      id={props.id}
      label={props.label}
      placeholder={props.placeholder}
      value={props.value || ''}
      options={props.options}
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('jsonEditor', props => (
    <JsonEditor
      label={props.label}
      inputKey={props.inputKey}
      value={props.value}
      onChange={props.onChange}
      required={props.required}
      error={props.error}
      tooltip={props.labelTooltip}
    />
  ));
  registerInputField('jsonArray', props => (
    <JsonEditor
      label={props.label}
      inputKey={props.inputKey}
      value={props.value}
      onChange={props.onChange}
      stringify={false}
      required={props.required}
    />
  ));
  registerInputField('boolean', props => (
    <RadioGroup
      id={props.id}
      label={props.label}
      onChange={event => props.onChange(props.inputKey, event.target.value === 'true')} // convert to boolean value
      options={[
        {
          label: 'Yes',
          value: true,
          tooltip: props.optionTooltips ? props.optionTooltips.true : null,
        },
        {
          label: 'No',
          value: false,
          tooltip: props.optionTooltips ? props.optionTooltips.false : null,
        },
      ]}
      value={props.value}
      disabled={props.disabled}
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('date', props => (
    <DatePicker
      id={props.id}
      label={props.label}
      value={props.moment(props.value).isValid() ? moment(props.value) : null}
      onChange={date => props.onChange(props.inputKey, date.toISOString())}
      disabled={props.disabled}
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('datetime-local', props => (
    <DateTimePicker
      id={props.id}
      label={props.label}
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
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('datetime-utc', props => (
    <DateTimePicker
      id={props.id}
      label={props.label}
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
      required={props.required}
      error={props.error}
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
        <Button id={props.id} color="primary">
          {props.label}
        </Button>
      </StyledLink>
    );
  });
  registerInputField('textarea', props => (
    <StyledTextField
      id={props.id}
      label={props.label}
      value={props.value || ''}
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      multiline
      type="textarea"
      rows="4"
      tooltip={props.labelTooltip}
      placeholder={props.placeholder}
      required={props.required}
      inputProps={{
        minLength: props.minLength,
        maxLength: props.maxLength,
        required: props.required,
      }}
      error={props.error}
    />
  ));
  registerInputField('text', props => (
    <StyledTextField
      id={props.id}
      label={props.label}
      value={props.value === undefined || props.value === null ? '' : props.value} // we still want to show 0 value
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      type={props.type}
      tooltip={props.labelTooltip}
      placeholder={props.placeholder}
      InputProps={{
        startAdornment: props.startAdornment ? (
          <InputAdornment position="start">{props.startAdornment}</InputAdornment>
        ) : null,
      }}
      // disable eslint rule as we want to allow the use of minLength and maxLength, and inputProps and InputProps are valid mui component props
      // eslint-disable-next-line react/jsx-no-duplicate-props
      inputProps={{
        minLength: props.minLength,
        maxLength: props.maxLength,
      }}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('password', props => (
    <StyledTextField
      id={props.id}
      label={props.label}
      value={props.value === undefined || props.value === null ? '' : props.value} // we still want to show 0 value
      onChange={event => props.onChange(props.inputKey, event.target.value)}
      disabled={props.disabled}
      type="password"
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('image', props => (
    <ImageUploadField
      name={props.name}
      imageSrc={props.value}
      onDelete={() => props.onChange(props.inputKey, null)}
      onChange={image => props.onChange(props.inputKey, image)}
      label={props.label}
      buttonLabel={props.buttonLabel}
      avatarVariant={props.avatarVariant}
      maxWidth={props.maxWidth}
      maxHeight={props.maxHeight}
      minWidth={props.minWidth}
      minHeight={props.minHeight}
      secondaryLabel={props.secondaryLabel}
      tooltip={props.labelTooltip}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('hexcode', props => (
    <HexcodeField
      id={props.id}
      label={props.label}
      value={props.value}
      onChange={value => props.onChange(props.inputKey, value)}
      disabled={props.disabled}
      tooltip={props.labelTooltip}
      placeholder={props.placeholder}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('checkbox', props => (
    <StyledCheckboxWrapper>
      <Checkbox
        id={props.id}
        label={props.label}
        checked={props.value || false}
        value={props.optionValue}
        onChange={e => props.onChange(props.inputKey, e.target.checked ? props.optionValue : null)}
        disabled={props.disabled}
        tooltip={props.labelTooltip}
        required={props.required}
        icon={<CheckboxUncheckedIcon />}
        checkedIcon={<CheckboxCheckedIcon />}
      />
    </StyledCheckboxWrapper>
  ));
  registerInputField('radio', props => (
    <RadioGroup
      id={props.id}
      label={props.label}
      onChange={event => props.onChange(props.inputKey, event.target.value)} // convert to boolean value
      options={props.options}
      value={props.value}
      disabled={props.disabled}
      tooltip={props.labelTooltip}
      name={props.name}
      required={props.required}
      error={props.error}
    />
  ));
  registerInputField('file', props => (
    <FileUploadField
      name={props.name}
      label={props.label}
      accept={props.accept}
      required={props.required}
      onChange={({ fileName, file }) => props.onSetFormFile(props.inputKey, { fileName, file })}
    />
  ));
};
