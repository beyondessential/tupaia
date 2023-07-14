/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Checkbox,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormGroup,
} from '@material-ui/core';
import CheckboxIcon from '@material-ui/icons/CheckBox';
import { NoData } from './NoData';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 0px 40px 30px 40px;
`;

const FileName = styled.span`
  flex: 1;
  margin-top: 10px;
  font-size: 20px;
  text-align: center;
  display: block;
  color: ${props => props.theme.palette.primary.contrastText};
`;

const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  margin-top: 10px;
  text-align: center;
`;

interface DownloadFilesVisualProps {
  downloadFiles: (uniqueFileNames: string[]) => Promise<void>;
  config?: object;
  data?: { uniqueFileName: string; label: string }[];
  isLoading?: boolean;
  isEnlarged?: boolean;
  onClose: () => void;
  className?: string;
  error?: string;
}

export const DownloadFilesVisual = ({
  downloadFiles,
  config = {},
  data: options = [],
  isLoading,
  isEnlarged,
  onClose,
  className,
  error,
}: DownloadFilesVisualProps) => {
  // selectedFiles: Map of uniqueFileName: string => isSelected: bool
  const noneSelected = Object.fromEntries(
    options.map(({ uniqueFileName }) => [uniqueFileName, false]),
  );
  const [selectedFiles, setSelectedFiles] = useState(noneSelected);

  const toggleSelectFile = (uniqueFileName: string) =>
    setSelectedFiles({ ...selectedFiles, [uniqueFileName]: !selectedFiles[uniqueFileName] });

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSelectedFiles = async () => {
    setIsDownloading(true);
    const selectedUniqueFilenames = Object.entries(selectedFiles)
      .filter(([, isSelected]) => isSelected)
      .map(([name]) => name);
    await downloadFiles(selectedUniqueFilenames);
    setIsDownloading(false);
  };

  if (!isEnlarged) {
    return (
      <Container className={className}>
        {options.map(({ label, uniqueFileName }) => (
          <FileName className="filename" key={uniqueFileName}>
            {label}
          </FileName>
        ))}
      </Container>
    );
  }

  if (!isLoading && options.length === 0) {
    return (
      <Container className={className}>
        <NoData viewContent={config} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={className}>
        <Error>{error}</Error>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <FormContainer>
        <FormControl>
          <FormGroup>
            {options.map(({ uniqueFileName, label }) => (
              <FormControlLabel
                key={uniqueFileName}
                control={
                  <Checkbox
                    checked={selectedFiles[uniqueFileName]}
                    checkedIcon={<CheckboxIcon className="checkbox-icon" />}
                    onChange={() => toggleSelectFile(uniqueFileName)}
                    value={uniqueFileName}
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>
        </FormControl>
      </FormContainer>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          onClick={downloadSelectedFiles}
          variant="contained"
          disabled={isDownloading || Object.values(selectedFiles).every(isSelected => !isSelected)}
        >
          Download
        </Button>
      </DialogActions>
    </Container>
  );
};
