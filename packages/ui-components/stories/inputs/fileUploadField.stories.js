/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
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

export const Simple = () => (
  <Container>
    <FileUploadField name="file-upload" />
  </Container>
);

export const Multiple = () => (
  <Container>
    <FileUploadField name="file-upload" multiple />
  </Container>
);
