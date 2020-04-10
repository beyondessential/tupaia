/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiTextField from '@material-ui/core/TextField';
import styled from 'styled-components';
import * as COLORS from '../../theme/colors';

/*
 * TextField
 */
export const TextField = styled(props => <MuiTextField {...props} variant="outlined" />)`
  width: 100%;
  margin-bottom: 1rem;

  .MuiInputBase-root {
    margin-top: 30px;
  }

  // The actual input field
  .MuiInputBase-input {
    background: #ffffff;
    font-weight: 400;
    font-size: 15px;
    line-height: 18px;
    padding: 21px 15px;
    color: #727d84;
    width: 100%;
    border-radius: 3px;
  }

  // The border
  .MuiOutlinedInput-notchedOutline {
    top: 0;
    border-color: ${COLORS.GREY_DE};

    legend {
      display: none;
    }
  }

  //.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
  //  border-color: #44535C;
  //}

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${COLORS.DARK_BLUE};
    border-width: 1px;
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${COLORS.DARK_BLUE};
  }

  // The label
  .MuiFormLabel-root {
    transform: none;
    font-size: 16px;
    font-weight: 500;
    line-height: 19px;
  }

  /*
  * Adornments
  */
  .MuiInputAdornment-positionEnd {
    color: ${COLORS.GREY_72};

    &:before {
      border-left: 1px solid ${COLORS.GREY_9F};
      height: 30px;
      content: '';
      padding-right: 15px;
    }
  }

  .MuiOutlinedInput-adornedEnd {
    padding-right: 18px;
  }

  /* Override MaterialUI which hides the placeholder due to conflict with it's floating labels */
  &&&& {
    .MuiInputBase-input::placeholder {
      opacity: 1 !important;
    }
  }

  // disable MaterialUI underline
  .MuiInput-underline:before,
  .MuiInput-underline:after {
    display: none;
  }

  /*
  * Textarea
   */
  .MuiOutlinedInput-multiline {
    padding: 0;
  }

  ${({ multiline }) =>
    multiline &&
    `
    .MuiInputBase-root {
      margin-top: 0;
      padding-top: 25px;
    }
    
    .MuiInputBase-input {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    
    .MuiFormLabel-root {
      padding-left: 15px;
      padding-top: 3px;
      padding-bottom: 3px;
      background: #dedede;
      display: block;
      width: 100%;
      font-size: 11px;
      font-weight: 600;
      z-index: -1;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }
  `};

  /*
  * Small size
  */
  .MuiInputBase-inputMarginDense {
    padding: 10px;
  }
`;

// export const TextField = ({ field, ...props }) => (
//   <TextInput name={field.name} value={field.value || ''} onChange={field.onChange} {...props} />
// );
