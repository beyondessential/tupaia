/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { darkWhite } from '../../styles';

export const ViewTitle = styled(Typography)`
  position: relative;
  color: ${darkWhite};
  margin-top: 5px;
  margin-bottom: 15px;
  line-height: 130%;
  text-align: center;
`;

export const PDFExportViewTitle = styled(ViewTitle)`
  color: black;
`;
