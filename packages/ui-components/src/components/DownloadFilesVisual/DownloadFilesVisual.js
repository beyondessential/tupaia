/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
import { getNoDataString } from '../Chart';
import { SmallAlert } from '../Alert';

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
`;

const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  margin-top: 10px;
  text-align: center;
`;

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

export const DownloadFilesVisual = ({
  downloadFiles,
  viewContent,
  isLoading,
  isEnlarged,
  onClose,
  className,
  error,
}) => {
  const { data = [] } = viewContent;
  const fileNames = data.map(({ name }) => name);
  const noneSelected = Object.fromEntries(fileNames.map(fileName => [fileName, false]));
  const [selectedFiles, setSelectedFiles] = useState(noneSelected);
  const toggleSelectFile = fileName =>
    setSelectedFiles({ ...selectedFiles, [fileName]: !selectedFiles[fileName] });
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSelectedFiles = async () => {
    setIsDownloading(true);
    const selectedFileNames = Object.entries(selectedFiles)
      .filter(([, isSelected]) => isSelected)
      .map(([name]) => name);

    const selectedFilePaths = selectedFileNames
      .map(fileName => data.find(({ name }) => name === fileName))
      .map(({ value }) => value);

    await downloadFiles(selectedFilePaths);
    setIsDownloading(false);
  };

  if (!isEnlarged) {
    return (
      <Container className={className}>
        {data.map(({ name: fileName }) => (
          <FileName className="filename" key={fileName}>
            {fileName}
          </FileName>
        ))}
      </Container>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <Container className={className}>
        <NoData severity="info" variant="standard">
          {getNoDataString(viewContent)}
        </NoData>
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
    <Container className={className} isLoading={isLoading} isEnlarged={isEnlarged}>
      <FormContainer>
        <FormControl>
          <FormGroup>
            {data.map(({ value: surveyCode, name: fileName }) => (
              <FormControlLabel
                key={surveyCode}
                control={
                  <Checkbox
                    checked={selectedFiles[fileName]}
                    checkedIcon={<CheckboxIcon className="checkbox-icon" />}
                    onChange={() => toggleSelectFile(fileName)}
                    value={surveyCode}
                  />
                }
                label={fileName}
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
          download
          disabled={isDownloading || Object.values(selectedFiles).every(isSelected => !isSelected)}
        >
          Download
        </Button>
      </DialogActions>
    </Container>
  );
};

DownloadFilesVisual.propTypes = {
  downloadFiles: PropTypes.func.isRequired,
  viewContent: PropTypes.object,
  isLoading: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  error: PropTypes.string,
};

DownloadFilesVisual.defaultProps = {
  viewContent: null,
  isLoading: false,
  isEnlarged: false,
  onClose: () => {},
  className: '',
  error: null,
};
