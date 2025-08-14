import React from 'react';
import PropTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Search } from '@material-ui/icons';
import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';
import { TextField } from '@tupaia/ui-components';

const TextFieldWrapper = styled.div`
  padding: 0 15px 20px 15px;
  border-bottom: 1px solid #dedee0;
`;

const StyledTextField = styled(TextField)`
  margin: 0;
  & .MuiInputBase-root {
    height: 40px;
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

InputField.propTypes = {
  getRootProps: PropTypes.func.isRequired,
  getInputProps: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

InputField.defaultProps = {
  isLoading: false,
};
