/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef, useState } from 'react';
import { QuestionType } from '@tupaia/types';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import {
  ClickAwayListener,
  FormControl,
  MenuItem,
  Popper,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { useDebounce } from '../../../utilities';

const CellContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  // popper is not full width by default
  > [role='tooltip'] {
    width: 100%;
  }
  ${props =>
    props.$isActive &&
    css`
      border: 1px solid ${props.theme.palette.primary.main};
    `}
`;

const CellText = styled(Typography)`
  width: 100%;
  border: none;
  background-color: transparent;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 0.5rem 0.2rem;
  max-width: 99%; // to apply ellipsis
  font-size: inherit;
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
    font-size: 0.7rem;
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

const CellInputWrapper = styled.div`
  min-height: 1.4rem;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const QuestionTypeOptions = Object.values(QuestionType).map(type => ({
  label: type,
  value: type,
}));

const SelectInput = styled(Select)`
  font-size: inherit;
  .MuiSelect-selectMenu {
    min-height: unset;
    font-size: inherit;
  }
`;

const TypeInput = ({ value, onChange }) => {
  return (
    <FormControl>
      <SelectInput value={value} onChange={onChange}>
        {QuestionTypeOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SelectInput>
    </FormControl>
  );
};

TypeInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export const EditableCell = ({
  cellData,
  rowIndex,
  setActiveCell,
  onChangeCellData,
  column,
  activeCell,
  editMode,
  setEditMode,
}) => {
  const [editValue, setEditValue] = useState(cellData);
  const debouncedEditValue = useDebounce(editValue, 500);
  const cellRef = useRef();

  const getIsActive = () => {
    if (!activeCell) return false;
    return activeCell.rowIndex === rowIndex && activeCell.column === column;
  };

  const isActive = getIsActive();

  const isEditingCell = editMode && isActive;

  const setCellInactive = () => {
    setActiveCell(null);
  };

  const setCellActive = () => {
    setActiveCell({
      rowIndex,
      column,
    });
  };

  // listener to finish editing and set as inactive when clicking outside the cell
  const handleClickOutside = e => {
    if (!isActive) return;
    if (!cellRef.current) return;
    if (cellRef.current.contains(e.target) || cellRef.current === e.target) return;
    const editableFieldInput = document.getElementById('editable-field');

    // this handles the select menu, because we are using a popper, so the click away listener senses a click on the select menu as a click away
    const isBody = e.target.tagName === 'BODY';
    if (isBody) {
      return;
    }

    // if the click is on the input, don't set as inactive, just remove edit mode so the input can be used
    if (editableFieldInput && editableFieldInput.contains(e.target)) {
      setEditMode(false);
      return;
    }

    setCellInactive();
  };

  const onClickCellButton = e => {
    const isDoubleClick = e.detail === 2;
    if (isDoubleClick) return handleDoubleClick();
    handleSingleClick();
  };

  const handleSingleClick = () => {
    // on first click, set as active
    if (!isActive) {
      return setCellActive();
    }
    // on second click, start editing
    if (!isEditingCell) {
      return setEditMode(true);
    }
  };

  // on double click, set as active and start editing straight away
  const handleDoubleClick = () => {
    setCellActive();
    setEditMode(true);
  };

  const onChange = e => {
    setEditValue(e.target.value);
  };

  // if we ever programmatically change the cell data, update the edit value
  useEffect(() => {
    if (!isEditingCell || cellData === editValue) return;

    setEditValue(cellData);
  }, [cellData]);

  // when the debounced edit value changes, update the cell data
  useEffect(() => {
    if (!isEditingCell || debouncedEditValue === cellData) return;

    onChangeCellData(rowIndex, column, debouncedEditValue);
  }, [debouncedEditValue]);

  const EditInput = column === 'type' ? TypeInput : EditableCellInput;

  return (
    <ClickAwayListener onClickAway={handleClickOutside}>
      <CellContent ref={cellRef} $isActive={isActive} onClick={onClickCellButton}>
        {/** Use an overlay here to prevent re-render issues when value changes */}
        <Popper open={isEditingCell} anchorEl={cellRef} disablePortal>
          <CellInputWrapper>
            <EditInput value={editValue} onChange={onChange} />
          </CellInputWrapper>
        </Popper>
        {!isEditingCell && <CellText>{cellData}</CellText>}
      </CellContent>
    </ClickAwayListener>
  );
};

EditableCell.propTypes = {
  cellData: PropTypes.string.isRequired,
  rowIndex: PropTypes.number.isRequired,
  column: PropTypes.string.isRequired,
  setActiveCell: PropTypes.func.isRequired,
  onChangeCellData: PropTypes.func.isRequired,
  activeCell: PropTypes.object,
  editMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
};

EditableCell.defaultProps = {
  activeCell: null,
};
