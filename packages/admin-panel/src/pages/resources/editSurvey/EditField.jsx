/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';

const Input = styled(TextField).attrs({
  variant: 'outlined',
  fullWidth: true,
})`
  margin-block-end: 0.5rem;
  .MuiOutlinedInput-root {
    border-radius: 0;
  }
  .MuiOutlinedInput-input {
    padding: 0.5rem;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.primary.main};
    border-width: 1px;
  }
`;

export const EditField = ({ data, activeCell, onChange }) => {
  if (!activeCell) return null;
  const { rowIndex, column } = activeCell;
  const cellData = data[rowIndex][column] ?? '';

  return <Input id="editable-field" value={cellData} onChange={onChange} />;
};

EditField.propTypes = {
  data: PropTypes.array.isRequired,
  activeCell: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
