/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import BaseTable, { Column } from 'react-base-table';
import 'react-base-table/styles.css';
import { SpinningLoader } from '@tupaia/ui-components';
import { EditableCell } from './EditableCell';
import { EditField } from './EditField';
import { useSpreadsheetJSON } from './useSpreadsheetJSON';
import { RowHeaderCell } from './RowHeaderCell';

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

export const Spreadsheet = ({ survey, open, currentFile }) => {
  const tableContainerRef = useRef();
  const [activeCell, setActiveCell] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { json, setJson, isLoading } = useSpreadsheetJSON(survey?.id, open, currentFile);

  const updateActiveCell = cell => {
    if (!cell) return setActiveCell(null);
    setActiveCell(cell);
  };

  // This needs to accept the rowIndex and column name to update the correct cell, because when we pass this into the cell, it memoizes the function and doesn't recognise that the active cell has been set by this point
  const updateCellData = (rowIndex, column, value) => {
    const updatedData = [...json];
    updatedData[rowIndex][column] = value;

    // update the data
    setJson(updatedData);
  };

  const addNewRow = rowIndex => {
    const updatedData = [...json];
    const generatedRow = columns.reduce((acc, column) => {
      if (column.id === 'id') return acc;
      acc[column.id] = '';
      return acc;
    }, {});
    updatedData.splice(rowIndex, 0, generatedRow);

    setJson(updatedData);
  };

  const removeRow = rowIndex => {
    const updatedData = [...json];
    updatedData.splice(rowIndex, 1);
    setJson(updatedData);
  };

  const columns = json
    ? [
        {
          key: 'id',
          id: 'id',
          dataKey: 'id',
          title: '',
          frozen: 'left',
          width: 60,
          cellRenderer: props => (
            <RowHeaderCell {...props} addNewRow={addNewRow} removeRow={removeRow} />
          ),
        },
        ...Object.keys(json[0]).map(key => ({
          key,
          id: key,
          dataKey: key,
          title: key,
          width: 100,
          resizable: true,
          cellRenderer: props => (
            <EditableCell
              {...props}
              activeCell={activeCell}
              setActiveCell={updateActiveCell}
              onChangeCellData={updateCellData}
              // eslint-disable-next-line react/prop-types
              column={columns[props.columnIndex]?.id}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          ),
        })),
      ]
    : [];

  const data = json ? json.map(row => ({ ...row, id: Math.random() * 1000 })) : [];

  return (
    <Wrapper>
      <EditField
        id="editable-field"
        activeCell={activeCell}
        onChange={updateCellData}
        cellData={data[activeCell?.rowIndex]?.[activeCell?.column] ?? ''}
      />
      <TableContainer ref={tableContainerRef}>
        {isLoading && <SpinningLoader />}
        <BaseTable
          data={data}
          columns={columns}
          maxHeight={tableContainerRef.current?.clientHeight ?? 0}
          fixed
          width={tableContainerRef.current?.clientWidth ?? 0}
          headerHeight={30}
          rowHeight={30}
          ignoreFunctionInColumnCompare={false}
        >
          {columns.map(column => (
            <Column key={column.id} {...column} />
          ))}
        </BaseTable>
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
