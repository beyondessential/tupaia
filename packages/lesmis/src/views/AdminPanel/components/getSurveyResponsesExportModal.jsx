/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import moment from 'moment';
import { DateTimePicker, RadioGroup } from '@tupaia/ui-components';
import { ReduxAutocomplete, ExportModal } from '@tupaia/admin-panel';
import { stripTimezoneFromDate } from '@tupaia/utils';

const MODES = {
  COUNTRY: 'country',
  ENTITY: 'entity',
};

export const getSurveyResponsesExportModal = translate => {
  const SurveyResponsesExportModal = props => {
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
        title={translate('admin.export')}
        values={values}
        exportEndpoint="surveyResponses"
        {...props}
      >
        <ReduxAutocomplete
          label={translate('admin.surveysToInclude')}
          helperText={translate('admin.pleaseEnterTheNamesOfTheSurveysToBeExported.')}
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
          onChange={event => setMode(event.currentTarget.value)}
          options={[
            {
              label: translate('admin.country'),
              value: MODES.COUNTRY,
            },
            {
              label: translate('admin.entity'),
              value: MODES.ENTITY,
            },
          ]}
          value={mode}
        />
        {mode === MODES.COUNTRY ? (
          <ReduxAutocomplete
            label={translate('admin.countriesToInclude')}
            helperText={translate('admin.pleaseEnterTheNamesOfTheCountriesToBeExported.')}
            reduxId="countryCode"
            onChange={inputValue => handleValueChange('countryCode', inputValue)}
            endpoint="countries"
            optionLabelKey="name"
            optionValueKey="code"
          />
        ) : (
          <ReduxAutocomplete
            label={translate('admin.entitiesToInclude')}
            helperText={translate('admin.pleaseEnterTheNamesOfTheEntitiesToBeExported')}
            reduxId="entityIds"
            onChange={inputValue => handleValueChange('entityIds', inputValue)}
            endpoint="entities"
            optionLabelKey="name"
            optionValueKey="id"
            allowMultipleValues
          />
        )}
        <DateTimePicker
          label={translate('admin.startDate')}
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
          label={translate('admin.endDate')}
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
      </ExportModal>
    );
  };

  return SurveyResponsesExportModal;
};
