/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { TextField } from '@material-ui/core';

const CellContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  ${props =>
    props.$isActive &&
    css`
      border: 1px solid ${props.theme.palette.primary.main};
    `}
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

export const EditableCell = ({ cellData, rowIndex, setActiveCell, onChangeCellData, column }) => {
  const cellRef = useRef();
  const [isActive, setIsActive] = useState(false);
  const [editing, setEditing] = useState(false);

  // Because the table memoizes the cells, we need to update the active cell when it changes in it's own state as a way to trigger a re-render
  useEffect(() => {
    if (isActive) setActiveCell({ rowIndex, column });
    else setActiveCell(null);
  }, [isActive]);

  // listener to finish editing and set as inactive when clicking outside the cell
  const handleClickOutside = e => {
    if (!cellRef.current) return;
    if (cellRef.current.contains(e.target)) return;
    const editableFieldInput = document.getElementById('editable-field');
    if (editableFieldInput && editableFieldInput.contains(e.target)) return;
    setEditing(false);
    setIsActive(false);
  };

  // listener to finish editing when clicking outside the cell
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onClickCellButton = e => {
    const isDoubleClick = e.detail === 2;
    if (isDoubleClick) return handleDoubleClick();
    handleSingleClick();
  };

  const handleSingleClick = () => {
    // on first click, set as active
    if (!isActive) {
      return setIsActive(true);
    }
    // on second click, start editing
    if (!editing) {
      return setEditing(true);
    }
  };

  // on double click, set as active and start editing straight away
  const handleDoubleClick = () => {
    setIsActive(true);
    setEditing(true);
  };

  const onChange = e => {
    onChangeCellData(rowIndex, column, e.target.value);
  };

  return (
    <CellContent ref={cellRef} $isActive={isActive}>
      {editing ? (
        <EditableCellInput value={cellData} onChange={onChange} />
      ) : (
        <CellButton onClick={onClickCellButton}>{cellData}</CellButton>
      )}
    </CellContent>
  );
};

EditableCell.propTypes = {
  cellData: PropTypes.string.isRequired,
  rowIndex: PropTypes.number.isRequired,
  column: PropTypes.string.isRequired,
  setActiveCell: PropTypes.func.isRequired,
  onChangeCellData: PropTypes.func.isRequired,
};
