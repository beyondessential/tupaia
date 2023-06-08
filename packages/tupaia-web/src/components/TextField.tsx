/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';
import { FORM_COLORS } from '../constants';

const StyledTextField = styled(MuiTextField)<TextFieldProps>`
  display: flex;
  width: 100%;
  margin-bottom: 0.7rem;

  .MuiFormLabel-root.MuiInputLabel-root {
    color: ${FORM_COLORS.BORDER};
  }

  .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiInputBase-formControl.MuiInput-formControl {
    &:before,
    &:after {
      border-bottom: 1px solid ${FORM_COLORS.BORDER};
    }
  }

  .MuiInputBase-input {
    color: white;
    font-size: 14px;
    line-height: 18px;
  }

  .MuiFormHelperText-root:not(.Mui-error) {
    color: ${FORM_COLORS.BORDER};
  }
`;
export const TextField = (props: TextFieldProps) => <StyledTextField {...props} />;
