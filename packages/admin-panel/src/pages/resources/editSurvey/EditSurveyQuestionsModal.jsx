/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog } from '@material-ui/core';
import { ModalContentProvider, ModalFooter, ModalHeader } from '../../../widgets';
import { Breadcrumbs } from '../../../layout';
import { Button } from '@tupaia/ui-components';

const StyledDialog = styled(Dialog)`
  // remove the breadcrumbs border
  .MuiBox-root > div {
    border-bottom: none;
  }
`;

export const EditSurveyQuestionsModal = ({ open, onClose, survey, setFormFile, currentFile }) => {
  const onSave = () => {
    // generate a new file with the updated questions
    //then call setFormFile with the new file
    // then close the modal
  };
  return (
    <StyledDialog open={open} onClose={onClose} disablePortal fullScreen>
      <ModalHeader onClose={onClose}>
        <Breadcrumbs
          parent={{
            title: 'Edit questions',
            isStatic: true,
          }}
          showBackButton={false}
          details={survey}
          title={survey.name}
          displayProperty="code"
        />
      </ModalHeader>
      <ModalContentProvider></ModalContentProvider>
      <ModalFooter>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </ModalFooter>
    </StyledDialog>
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
