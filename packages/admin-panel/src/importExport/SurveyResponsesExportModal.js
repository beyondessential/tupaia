/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { exportData } from './actions';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  LightOutlinedButton,
  OutlinedButton,
  SaveAlt,
} from '@tupaia/ui-components';
import { ModalContentProvider } from '../widgets';
import { Autocomplete } from '../autocomplete';

const SurveyResponsesExportModalComponent = ({ onExport, errorMessage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} disableBackdropClick>
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={errorMessage ? 'Error' : 'Export Survey Responses'}
          color={errorMessage ? 'error' : 'textPrimary'}
        />
        <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
          <form action="">
            <Autocomplete
              label="Surveys to Include"
              helperText="Please enter the names of the surveys to be exported."
              endpoint="country/{id}/surveys"
              optionLabelKey={optionLabelKey}
              optionValueKey={optionValueKey}
              reduxId={inputKey}
              onChange={inputValue => onChange(inputKey, inputValue)}
              canCreateNewOptions={canCreateNewOptions}
              disabled={disabled}
              allowMultipleValues={allowMultipleValues}
              parentRecord={parentRecord}
            />
          </form>
        </ModalContentProvider>
        <DialogFooter>
          <OutlinedButton onClick={() => setIsOpen(false)} disabled={isLoading}>
            {errorMessage ? 'Dismiss' : 'Cancel'}
          </OutlinedButton>
          <Button onClick={() => onExport()} disabled={!!errorMessage || isLoading}>
            Export
          </Button>
        </DialogFooter>
      </Dialog>
      <LightOutlinedButton startIcon={<SaveAlt />} onClick={() => setIsOpen(true)}>
        Export
      </LightOutlinedButton>
    </>
  );
};

SurveyResponsesExportModalComponent.propTypes = {
  onExport: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

SurveyResponsesExportModalComponent.defaultProps = {
  errorMessage: null,
};

const mapStateToProps = ({ importExport }) => ({
  isOpen: importExport.isExportDialogOpen,
  errorMessage: importExport.errorMessage,
});

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  onExport: (queryParameters, parentRecord) =>
    dispatch(exportData(actionConfig, parentRecord, queryParameters)),
});

export const SurveyResponsesExportModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SurveyResponsesExportModalComponent);
