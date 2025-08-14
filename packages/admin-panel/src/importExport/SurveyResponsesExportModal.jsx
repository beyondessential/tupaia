import React, { useState } from 'react';
import moment from 'moment';
import { DateTimePicker, RadioGroup } from '@tupaia/ui-components';
import { stripTimezoneFromDate } from '@tupaia/utils';
import { ReduxAutocomplete } from '../autocomplete';
import { ExportModal } from './ExportModal';
import { EntityOptionLabel } from '../widgets';
import { Checkbox, FormControlLabel } from '@material-ui/core';

const MODES = {
  COUNTRY: { value: 'country', formInput: 'countryCode' },
  ENTITY: { value: 'entity', formInput: 'entityIds' },
};

export const SurveyResponsesExportModal = () => {
  const [values, setValues] = useState({});
  const [mode, setMode] = useState(MODES.COUNTRY.value);
  const [countryCode, setCountryCode] = useState(); // Keep local copy to ensure form stays in sync with input
  const [entityIds, setEntityIds] = useState(); // Keep local copy to ensure form stays in sync with input

  const onChangeMode = newMode => {
    setMode(newMode);
    if (newMode === MODES.COUNTRY.value) {
      handleValueChange(MODES.COUNTRY.formInput, countryCode);
      handleValueChange(MODES.ENTITY.formInput, undefined);
    } else {
      handleValueChange(MODES.COUNTRY.formInput, undefined);
      handleValueChange(MODES.ENTITY.formInput, entityIds);
    }
  };

  const handleValueChange = (key, value) => {
    setValues(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const clearValues = () => {
    setValues({});
    onChangeMode(MODES.COUNTRY.value);
    setCountryCode(undefined);
    setEntityIds(undefined);
  };

  return (
    <ExportModal
      title="Download survey responses"
      values={values}
      exportEndpoint="surveyResponses"
      onCloseModal={clearValues}
    >
      <ReduxAutocomplete
        label="Surveys to include"
        helperText="Please enter the names of the surveys to be exported."
        reduxId="surveyCodes"
        onChange={inputValue => handleValueChange('surveyCodes', inputValue)}
        endpoint="surveys"
        optionLabelKey="name"
        optionValueKey="code"
        allowMultipleValues
      />
      <RadioGroup
        name="survey responses mode"
        label="Level"
        onChange={event => onChangeMode(event.currentTarget.value)}
        options={[
          {
            label: 'Country',
            value: MODES.COUNTRY.value,
          },
          {
            label: 'Entity',
            value: MODES.ENTITY.value,
          },
        ]}
        value={mode}
      />
      {mode === MODES.COUNTRY.value ? (
        <ReduxAutocomplete
          label="Country to include"
          helperText="Please enter the name of the country to be exported."
          reduxId="countryCode"
          onChange={inputValue => {
            setCountryCode(inputValue);
            handleValueChange('countryCode', inputValue);
          }}
          endpoint="countries"
          optionLabelKey="name"
          optionValueKey="code"
        />
      ) : (
        <ReduxAutocomplete
          label="Entities to include"
          helperText="Please enter the names of the entities to be exported."
          reduxId="entityIds"
          onChange={inputValue => {
            setEntityIds(inputValue);
            handleValueChange('entityIds', inputValue);
          }}
          endpoint="entities"
          optionLabelKey="name"
          optionValueKey="id"
          renderOption={option => <EntityOptionLabel {...option} />}
          optionFields={['id', 'code', 'name']}
          allowMultipleValues
        />
      )}
      <DateTimePicker
        label="Start date"
        format="yyyy-MM-dd HH:mm"
        value={
          values.startDate && moment(values.startDate).isValid
            ? moment(values.startDate).format('YYYY-MM-DDTHH:mm')
            : null
        }
        onChange={date => {
          if (date && moment(date).isValid()) {
            handleValueChange('startDate', stripTimezoneFromDate(date));
          }
        }}
      />
      <DateTimePicker
        label="End date"
        format="yyyy-MM-dd HH:mm"
        value={
          values.endDate && moment(values.endDate).isValid
            ? moment(values.endDate).format('YYYY-MM-DDTHH:mm')
            : null
        }
        onChange={date => {
          if (date && moment(date).isValid()) {
            handleValueChange('endDate', stripTimezoneFromDate(date));
          }
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.includeArchived}
            onChange={event => handleValueChange('includeArchived', event.target.checked)}
            name="include-archived"
            color="primary"
          />
        }
        label="Include archived survey responses"
      />
    </ExportModal>
  );
};
