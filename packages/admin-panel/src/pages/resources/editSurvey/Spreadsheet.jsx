/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import { TextField } from '@material-ui/core';
import BaseTable from 'react-base-table';
import 'react-base-table/styles.css';
import { useApiContext } from '../../../utilities/ApiProvider';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
  .BaseTable__header-cell {
    background-color: ${props => props.theme.palette.grey['400']};
    border-right: 1px solid white;
    font-weight: ${props => props.theme.typography.fontWeightMedium};
  }
  .BaseTable__row-cell {
    border-right: 1px solid ${props => props.theme.palette.grey['400']};
    padding: 0;
  }
  .BaseTable__row {
    border-color: ${props => props.theme.palette.grey['400']};
  }
  .BaseTable__table-frozen-left {
    .BaseTable__row-cell {
      background-color: ${props => props.theme.palette.grey['400']};
      font-weight: ${props => props.theme.typography.fontWeightMedium};
    }
    .BaseTable__row {
      border-color: white;
    }
  }
`;

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

const EditFieldInput = styled(TextField).attrs({
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

const EditableField = ({ data, activeCell, onChange }) => {
  if (!activeCell) return null;
  const { rowIndex, column } = activeCell;
  const cellData = data[rowIndex][column] ?? '';

  return <EditFieldInput id="editable-field" value={cellData} onChange={onChange} />;
};

EditableField.propTypes = {
  data: PropTypes.array.isRequired,
  activeCell: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

const useInitialFile = (surveyId, isOpen, uploadedFile = null) => {
  const [file, setFile] = useState(uploadedFile);

  const [error, setError] = useState(null);
  const api = useApiContext();
  const getInitialFile = async () => {
    try {
      const blob = await api.download(`export/surveys/${surveyId}`, {}, null, true);
      const arrayBuffer = await blob.arrayBuffer();

      setFile(arrayBuffer);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (file || !isOpen) return;
    if (uploadedFile) {
      setFile(uploadedFile);
    } else getInitialFile();
  }, [isOpen]);

  return { file, error };
};

const useSpreadsheetJson = file => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson(sheetJson);
  }, [file]);

  return { json, setJson };
};

const EditableCell = ({ cellData, rowIndex, columnIndex, setActiveCell }) => {
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

export const Spreadsheet = ({ survey, open, currentFile }) => {
  const tableContainerRef = useRef();
  const editFieldRef = useRef();
  const [activeCell, setActiveCell] = useState(null);
  const { file } = useInitialFile(survey?.id, open, currentFile);
  const { json, setJson } = useSpreadsheetJson(file);

  const getIsCellActive = ({ rowIndex, columnIndex }) => {
    return activeCell?.rowIndex === rowIndex && activeCell?.columnIndex === columnIndex;
  };

  const updateActiveCell = cell => {
    if (!cell) return setActiveCell(null);
    const { rowIndex, columnIndex } = cell;
    setActiveCell({ rowIndex, column: columns[columnIndex].id });
  };

  const EditableCellComponent = props => (
    <EditableCell
      {...props}
      activeCell={activeCell}
      setActiveCell={updateActiveCell}
      getIsCellActive={getIsCellActive}
      editFieldRef={editFieldRef}
    />
  );

  const columns = json
    ? [
        {
          key: 'id',
          id: 'id',
          dataKey: 'id',
          title: '',
          width: 50,
          frozen: true,
        },
        ...Object.keys(json[0]).map(key => ({
          key,
          id: key,
          dataKey: key,
          title: key,
          width: 100,
          resizable: true,
          cellRenderer: EditableCellComponent,
        })),
      ]
    : [];

  const data = useMemo(() => {
    if (!json) return [];
    return json.map((row, index) => ({ ...row, id: index + 1 }));
  }, [JSON.stringify(json)]);

  const updateCellData = e => {
    const { rowIndex, column } = activeCell;
    const updatedData = [...json];
    updatedData[rowIndex][column] = e.target.value;

    // update the data
    setJson(updatedData);
  };

  return (
    <Wrapper>
      <TableContainer ref={tableContainerRef}>
        <EditableField
          id="editable-field"
          activeCell={activeCell}
          data={data}
          onChange={updateCellData}
        />
        <BaseTable
          data={data}
          columns={columns}
          maxHeight={tableContainerRef.current?.clientHeight ?? 0}
          fixed
          width={tableContainerRef.current?.clientWidth ?? 0}
          headerHeight={30}
          rowHeight={30}
        />
      </TableContainer>
    </Wrapper>
  );
};

Spreadsheet.propTypes = {
  open: PropTypes.bool.isRequired,
  survey: PropTypes.object.isRequired,
  currentFile: PropTypes.object,
};

Spreadsheet.defaultProps = {
  currentFile: null,
};
