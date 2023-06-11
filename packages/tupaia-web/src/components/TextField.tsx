/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';
import { FORM_COLORS } from '../constants';

const StyledTextField = styled(MuiTextField)<TextFieldProps>`
  display: flex;
  width: 100%;
  margin-bottom: 0.7rem;

  // Todo Fix nested material ui themes
  .MuiFormLabel-root.MuiInputLabel-root {
    color: ${FORM_COLORS.BORDER};
  }

  .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiInputBase-formControl.MuiInput-formControl {
    &:before,
    &:after {
      border-width: 1px;
    }
  }

  .MuiInputBase-input {
    color: white;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .MuiFormHelperText-root:not(.Mui-error) {
    color: ${FORM_COLORS.BORDER};
  }
`;
export const TextField = (props: TextFieldProps) => <StyledTextField {...props} />;
