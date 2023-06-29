/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import InputAdornment from '@material-ui/core/InputAdornment';
import { Search } from '@material-ui/icons';
import React from 'react';
import styled from 'styled-components';
import { TextField } from '../Inputs';
import { CircularProgress } from '@material-ui/core';

const TextFieldWrapper = styled.div`
  padding: 0 15px 20px 15px;
  border-bottom: 1px solid #dedee0;
`;

const StyledTextField = styled(TextField)`
  margin: 0;
  & .MuiInputBase-root {
    height: 40px;
  }
  & .MuiInputBase-input {
    font-size: 14px;
  }
`;

export const InputField = ({ getRootProps, getInputProps, isLoading }) => (
  <TextFieldWrapper {...getRootProps()}>
    <StyledTextField
      placeholder="Search Data"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isLoading ? <CircularProgress size={20} /> : <Search />}
          </InputAdornment>
        ),
        ...getInputProps(),
      }}
    />
  </TextFieldWrapper>
);
