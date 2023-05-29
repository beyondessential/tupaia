/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  const [fileName, setFileName] = useState('No File chosen');
  return (
    <Container>
      <FileUploadField
        onChange={(event, newName) => {
          setFileName(newName);
        }}
        name="file-upload"
        fileName={fileName}
      />
    </Container>
  );
};

export const Multiple = () => {
  const [fileName, setFileName] = useState('No File chosen');
  return (
    <Container>
      <FileUploadField
        onChange={(event, newName) => {
          setFileName(newName);
        }}
        name="file-upload"
        fileName={fileName}
        multiple
      />
    </Container>
  );
};
