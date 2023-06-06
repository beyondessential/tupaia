/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';

const StyledTextField = styled(MuiTextField)<TextFieldProps>`
  display: flex;
  width: 100%;
  margin-bottom: 0.7rem;

  .MuiFormLabel-root {
    color: #9ba0a6 !important;
  }

  .MuiInputBase-root.MuiInput-underline {
    &:before,
    &:after {
      border-bottom: 1px solid #9ba0a6 !important;
    }
  }

  .MuiInputBase-input {
    color: white;
    font-size: 14px;
    line-height: 18px;
  }
`;
export const TextField = props => <StyledTextField {...props} />;
