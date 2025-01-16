import React, { useState } from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { FileUploadField } from '../../src';

export default {
  title: 'Inputs/FileUploadField',
  component: FileUploadField,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const Simple = () => {
  const [files, setFiles] = useState([]);
  return (
    <Container>
      <FileUploadField
        onChange={newFiles => setFiles(newFiles)}
        name="file-upload"
        label="File Upload"
      />
    </Container>
  );
};

export const SimpleWithTooltip = () => {
  const [files, setFiles] = useState([]);
  return (
    <Container>
      <FileUploadField
        accept={{
          'application/vnd.ms-excel': ['.xls'],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'image/jpeg': ['.jpeg', '.jpg'],
          'image/png': ['.png'],
        }}
        onChange={newFiles => setFiles(newFiles)}
        name="file-upload"
        label="File Upload"
        tooltip="Excel, JPEG & PNG files only"
      />
    </Container>
  );
};

export const Multiple = () => {
  const [files, setFiles] = useState([]);
  return (
    <Container>
      <FileUploadField onChange={newFiles => setFiles(newFiles)} name="file-upload" multiple />
    </Container>
  );
};

export const WithLabel = () => {
  const [files, setFiles] = useState([]);
  return (
    <Container>
      <FileUploadField
        onChange={newFiles => setFiles(newFiles)}
        name="file-upload"
        label="Profile Image"
        helperText="Select an image to use as your profile pic"
      />
    </Container>
  );
};

export const WithMaxFileSize = () => {
  const [files, setFiles] = useState([]);
  return (
    <Container>
      <FileUploadField
        onChange={newFiles => setFiles(newFiles)}
        name="file-upload"
        label="File Upload"
        tooltip="Max. file size 10 KiB"
        maxSizeInBytes={1024 * 10} /* 10 KiB */
      />
    </Container>
  );
};
