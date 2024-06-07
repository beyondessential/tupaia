/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import { Dialog } from '@material-ui/core';
import { Button } from '@tupaia/ui-components';
import { ModalContentProvider, ModalFooter, ModalHeader } from '../../../widgets';
import { Breadcrumbs } from '../../../layout';
import { useApiContext } from '../../../utilities/ApiProvider';

const StyledDialog = styled(Dialog)`
  // remove the breadcrumbs border
  .MuiBox-root > div {
    border-bottom: none;
  }
`;

const useInitialFile = (surveyId, isOpen, uploadedFile = null) => {
  const [file, setFile] = useState(uploadedFile);

  const [error, setError] = useState(null);
  const api = useApiContext();
  const getInitialFile = async () => {
    try {
      const blob = await api.download(`export/surveys/${surveyId}`, {}, null, true);
      const arrayBuffer = await blob.arrayBuffer();

      setFile(arrayBuffer);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (file || !isOpen) return;
    if (uploadedFile) {
      setFile(uploadedFile);
    } else getInitialFile();
  }, [isOpen]);

  return { file, error };
};

const useSpreadsheetJson = file => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson(sheetJson);
  }, [file]);

  return json;
};

export const EditSurveyQuestionsModal = ({ open, onClose, survey, setFormFile, currentFile }) => {
  const { file } = useInitialFile(survey?.id, open, currentFile);
  const json = useSpreadsheetJson(file);
  console.log(json);

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
          title={survey?.name}
          displayProperty="code"
        />
      </ModalHeader>
      <ModalContentProvider></ModalContentProvider>
      <ModalFooter>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button>Save</Button>
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
