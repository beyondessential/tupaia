/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';

const CellContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const CellButton = styled.button`
  height: 100%;
  width: 100%;
  border: none;
  background-color: transparent;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 0.2rem;
  max-width: 99%; // to apply ellipsis
`;

const EditableCellInput = styled(TextField).attrs({
  autoFocus: true,
  fullWidth: true,
  variant: 'outlined',
})`
  width: 100%;
  height: 100%;
  flex: 1;
  .MuiOutlinedInput-input {
    padding: 0.2rem;
  }
  .MuiInputBase-formControl {
    padding: 0;
    height: 100%;
    width: 100%;
    flex: 1;
  }
  .MuiOutlinedInput-notchedOutline {
    border-radius: 0;
    border-color: ${props => props.theme.palette.primary.main};
  }
`;

export const EditableCell = ({ cellData, rowIndex, columnIndex, setActiveCell }) => {
  const cellRef = useRef();
  const [editing, setEditing] = useState(false);

  const [value, setValue] = useState(cellData ?? '');

  const toggleEditing = () => {
    setEditing(!editing);
  };

  useEffect(() => {
    if (editing) setActiveCell({ rowIndex, columnIndex });
    else setActiveCell(null);
  }, [editing]);

  useEffect(() => {
    setValue(cellData);
  }, [cellData]);

  const handleClickOutside = e => {
    if (!cellRef.current) return;
    if (cellRef.current.contains(e.target)) return;
    const editableFieldInput = document.getElementById('editable-field');
    if (editableFieldInput && editableFieldInput.contains(e.target)) return;
    setEditing(false);
  };

  // listener to finish editing when clicking outside the cell
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <CellContent ref={cellRef}>
      {editing ? (
        <EditableCellInput value={value} onChange={e => setValue(e.target.value)} />
      ) : (
        <CellButton onClick={toggleEditing}>{value}</CellButton>
      )}
    </CellContent>
  );
};

EditableCell.propTypes = {
  cellData: PropTypes.string.isRequired,
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  setActiveCell: PropTypes.func.isRequired,
};
