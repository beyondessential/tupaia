/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, Typography } from '@material-ui/core';
import { Button, SpinningLoader } from '@tupaia/ui-components';
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

const StyledDialog = styled(Dialog)`
  // remove the breadcrumbs border
  .MuiBox-root > div {
    border-bottom: none;
  }
`;

export const EditSurveyQuestionsModal = ({ open, onClose, survey, setFormFile, currentFile }) => {
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
          {isLoading && <SpinningLoader />}
          <Spreadsheet data={json} setData={setJson} />
        </ModalContentProvider>
        <ModalFooter>
          <Button onClick={onCloseModal} variant="outlined">
            Cancel
          </Button>
          <Button>Save</Button>
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
  setFormFile: PropTypes.func.isRequired,
  currentFile: PropTypes.object,
};

EditSurveyQuestionsModal.defaultProps = {
  currentFile: null,
};
