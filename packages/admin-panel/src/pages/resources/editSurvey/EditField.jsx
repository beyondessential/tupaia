/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import { useDebounce } from '../../../utilities';

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

const Placeholder = styled.div`
  height: 2.5rem;
`;

export const EditField = ({ activeCell, cellData, onChange }) => {
  const [value, setValue] = useState(cellData);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedValue === cellData || !activeCell) return;
    const { rowIndex, column } = activeCell;
    onChange(rowIndex, column, debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (cellData === value) return;
    setValue(cellData);
  }, [cellData]);

  if (!activeCell) return <Placeholder />;

  return <Input id="editable-field" value={value} onChange={e => setValue(e.target.value)} />;
};

EditField.propTypes = {
  cellData: PropTypes.string.isRequired,
  activeCell: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
