/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import moment from 'moment';
import { DateTimePicker, RadioGroup } from '@tupaia/ui-components';
import { Autocomplete } from '../autocomplete';
import { ExportModal } from './ExportModal';

const MODES = {
  COUNTRY: 'country',
  ENTITY: 'entity',
};

export const SurveyResponsesExportModal = () => {
  const [values, setValues] = useState({});
  const [mode, setMode] = useState(MODES.COUNTRY);

  const handleValueChange = (key, value) => {
    setValues(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <ExportModal
      title="Export Survey Responses"
      values={values}
      exportEndpoint="surveyResponses"
      fileName={`survey-responses-${Date.now()}.xlsx`}
    >
      <Autocomplete
        label="Surveys to Include"
        helperText="Please enter the names of the surveys to be exported."
        reduxId="surveyCodes"
        onChange={inputValue => handleValueChange('surveyCodes', inputValue)}
        endpoint="surveys"
        optionLabelKey="name"
        optionValueKey="code"
        allowMultipleValues
      />
      <RadioGroup
        label="Mode"
        onChange={event => setMode(event.currentTarget.value)}
        options={[
          {
            label: 'Country',
            value: MODES.COUNTRY,
          },
          {
            label: 'Entity',
            value: MODES.ENTITY,
          },
        ]}
        value={mode}
      />
      {mode === MODES.COUNTRY ? (
        <Autocomplete
          label="Countries to Include"
          helperText="Please enter the names of the countries to be exported."
          reduxId="countryCode"
          onChange={inputValue => handleValueChange('countryCode', inputValue)}
          endpoint="country"
          optionLabelKey="name"
          optionValueKey="code"
        />
      ) : (
        <Autocomplete
          label="Entities to Include"
          helperText="Please enter the names of the entities to be exported."
          reduxId="entityIds"
          onChange={inputValue => handleValueChange('entityIds', inputValue)}
          endpoint="entity"
          optionLabelKey="name"
          optionValueKey="code"
          allowMultipleValues
        />
      )}
      <DateTimePicker
        label="Start Date"
        format="yyyy-MM-dd HH:mm"
        value={
          values.startDate && moment(values.startDate).isValid
            ? moment(values.startDate).format('YYYY-MM-DDTHH:mm')
            : null
        }
        onChange={date => {
          if (date && moment(date).isValid()) {
            handleValueChange('startDate', moment(date).toISOString());
          }
        }}
      />
      <DateTimePicker
        label="End Date"
        format="yyyy-MM-dd HH:mm"
        value={
          values.endDate && moment(values.endDate).isValid
            ? moment(values.endDate).format('YYYY-MM-DDTHH:mm')
            : null
        }
        onChange={date => {
          if (date && moment(date).isValid()) {
            handleValueChange('endDate', moment(date).toISOString());
          }
        }}
      />
    </ExportModal>
  );
};
