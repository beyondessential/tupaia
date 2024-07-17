/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import { Dialog, Typography } from '@material-ui/core';
import { Alert, Button, SpinningLoader } from '@tupaia/ui-components';
import {
  Modal,
  ModalCenteredContent,
  ModalContentProvider,
  ModalFooter,
  ModalHeader,
} from '../../../widgets';
import { Breadcrumbs } from '../../../layout';
import { Spreadsheet } from './Spreadsheet';
import { useSpreadsheetJSON } from './useSpreadsheetJSON';
import download from 'downloadjs';

const StyledDialog = styled(Dialog)`
  // remove the breadcrumbs border
  .MuiBox-root > div {
    border-bottom: none;
  }
`;

export const EditSurveyQuestionsModal = ({
  open,
  onClose,
  survey,
  onSave,
  currentFile,
  isSaving,
  errorMessage,
}) => {
  const [confirmCloseModalOpen, setConfirmCloseModalOpen] = useState(false);
  const { json, setJson, isLoading, dataHasBeenChanged } = useSpreadsheetJSON(
    survey?.id,
    open,
    currentFile,
  );

  const onCloseModal = () => {
    if (!dataHasBeenChanged) {
      setJson(null);
      return onClose();
    }
    setConfirmCloseModalOpen(true);
  };

  const onCancelEdits = () => {
    setConfirmCloseModalOpen(false);
    setJson(null);
    onClose();
  };

  const onSaveFile = async () => {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(wb, ws, survey.name);
    const wbOutput = xlsx.write(wb, { bookType: 'xlsx', type: 'base64' });
    const fullBase64 = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbOutput}`;

    // convert to blob
    const base64Response = await fetch(fullBase64);

    const blob = await base64Response.blob();

    const fileName = `${survey.name}.xlsx`;
    onSave(
      {
        surveyQuestions: blob,
      },
      onClose,
      {
        surveyQuestions: fileName,
      },
    );
  };

  const buttonsDisabled = isSaving || isLoading;

  return (
    <>
      <StyledDialog open={open} onClose={onCloseModal} disablePortal fullScreen>
        <ModalHeader onClose={onCloseModal}>
          <Breadcrumbs
            parent={{
              title: 'Edit questions',
              isStatic: true,
            }}
            showBackButton={false}
            details={survey}
            title={survey?.name}
            displayProperty="code"
          />
        </ModalHeader>
        <ModalContentProvider>
          {(isLoading || isSaving) && (
            <SpinningLoader
              text={
                isSaving && 'Saving survey questions. Please be patient, this can take some time...'
              }
            />
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <Spreadsheet data={json} setData={setJson} />
        </ModalContentProvider>
        <ModalFooter>
          <Button onClick={onCloseModal} variant="outlined" disabled={buttonsDisabled}>
            Cancel
          </Button>
          <Button onClick={onSaveFile} disabled={buttonsDisabled}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </StyledDialog>
      <Modal
        onClose={onCancelEdits}
        open={confirmCloseModalOpen}
        title="Cancel edits"
        buttons={[
          {
            text: 'Back to editing',
            onClick: () => setConfirmCloseModalOpen(false),
            variant: 'outlined',
          },
          {
            text: 'Confirm',
            onClick: onCancelEdits,
          },
        ]}
      >
        <ModalCenteredContent>
          <Typography>
            Are you sure you would like to cancel? You will lose any changes you’ve made.
          </Typography>
        </ModalCenteredContent>
      </Modal>
    </>
  );
};

EditSurveyQuestionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  survey: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  currentFile: PropTypes.object,
  isSaving: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

EditSurveyQuestionsModal.defaultProps = {
  currentFile: null,
  errorMessage: null,
};
