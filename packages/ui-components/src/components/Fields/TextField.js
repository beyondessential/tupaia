/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiInputBase from '@material-ui/core/InputBase';
import MuiInputLabel from '@material-ui/core/InputLabel';
import MuiTextField from '@material-ui/core/TextField';
import styled from 'styled-components';

/*
 * TextField
 */

export const TextField = styled(props => <MuiTextField {...props} variant="outlined" />)`
  width: 100%;
  margin-bottom: 1rem;

  .MuiInputBase-root {
    display: flex;
    margin-top: 30px;
  }

  .MuiInputBase-input {
    background: #ffffff;
    border-radius: 3px;
    font-weight: 400;
    font-size: 15px;
    line-height: 18px;
    padding: 21px 15px;
    color: #727d84;
    width: 100%;
  }

  .MuiOutlinedInput-notchedOutline {
    top: 0;
    border-color: #dedee0;
    
    legend {
      display: none;
    }
  }

  /* Override MaterialUI which hides the placeholder due to conflict with it's floating labels */
  &&&& {
    .MuiInputBase-input::placeholder {
      opacity: 1 !important;
    }
  }

  .MuiInput-underline:before,
  .MuiInput-underline:after {
    display: none;
  }

  .MuiFormLabel-root {
    transform: none;
    font-size: 16px;
    font-weight: 500;
    line-height: 19px;
  }

  /* Small */
  .MuiInputBase-inputMarginDense {
    padding: 10px 10px;
  }
`;

// export const TextField = ({ field, ...props }) => (
//   <TextInput name={field.name} value={field.value || ''} onChange={field.onChange} {...props} />
// );
