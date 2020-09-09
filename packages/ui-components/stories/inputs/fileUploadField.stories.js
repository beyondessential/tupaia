/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { FileUploadField as FileUploadFieldComponent } from '../../src';

export default {
  title: 'FileUploadField',
  component: FileUploadFieldComponent,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const FileUploadField = () => {
  const [value, setValue] = useState(null);

  const handleChange = event => {
    console.log('on change', event.target.value);
  };

  return (
    <Container>
      <FileUploadFieldComponent onChange={handleChange} value={value} name="file-upload" />
    </Container>
  );
};
