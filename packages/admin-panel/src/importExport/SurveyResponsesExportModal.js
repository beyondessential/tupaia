/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  LightOutlinedButton,
  OutlinedButton,
  SaveAlt,
  DateTimePicker,
  RadioGroup,
} from '@tupaia/ui-components';
import { filteredExportData } from './actions';
import { ModalContentProvider } from '../widgets';
import { Autocomplete } from '../autocomplete';

const MODES = {
  COUNTRY: 'country',
  ENTITY: 'entity',
};

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const SurveyResponsesExportModalComponent = ({ onExport }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [values, setValues] = useState({});
  const [mode, setMode] = useState(MODES.COUNTRY);

  const handleValueChange = (key, value) => {
    setValues(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorMessage(null);
    setStatus(STATUS.LOADING);

    if (mode === MODES.COUNTRY) {
      delete values.entities;
    } else {
      delete values.countries;
    }

    console.log('values', values);

    try {
      await onExport(values);
      setStatus(STATUS.SUCCESS);
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
  };

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} disableBackdropClick>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader
            onClose={() => setIsOpen(false)}
            title={errorMessage ? 'Error' : 'Export Survey Responses'}
            color={errorMessage ? 'error' : 'textPrimary'}
          />
          <ModalContentProvider errorMessage={errorMessage} isLoading={status === STATUS.LOADING}>
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
          </ModalContentProvider>
          <DialogFooter>
            {status === STATUS.ERROR ? (
              <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
            ) : (
              <OutlinedButton onClick={() => setIsOpen(false)}>Cancel</OutlinedButton>
            )}
            <Button
              type="submit"
              disabled={status === STATUS.ERROR}
              isLoading={status === STATUS.LOADING}
            >
              Export
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      <LightOutlinedButton
        startIcon={<SaveAlt />}
        onClick={() => setIsOpen(true)}
        isLoading={STATUS === STATUS.LOADING}
        disabled={STATUS === STATUS.ERROR}
      >
        Export
      </LightOutlinedButton>
    </>
  );
};

SurveyResponsesExportModalComponent.propTypes = {
  onExport: PropTypes.func.isRequired,
};

const actionConfig = {
  exportEndpoint: 'surveyResponses',
  fileName: `survey-responses-${Date.now()}.xlsx`,
};

const mapDispatchToProps = dispatch => ({
  onExport: queryParameters => dispatch(filteredExportData(actionConfig, queryParameters)),
});

export const SurveyResponsesExportModal = connect(
  null,
  mapDispatchToProps,
)(SurveyResponsesExportModalComponent);
