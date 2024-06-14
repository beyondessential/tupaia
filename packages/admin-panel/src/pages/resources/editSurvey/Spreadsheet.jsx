/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import { EditableCell } from './EditableCell';
import { EditField } from './EditField';
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
  max-width: 1800px;
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

export const Spreadsheet = ({ data, setData }) => {
  const tableContainerRef = useRef();
  const [activeCell, setActiveCell] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // This needs to accept the rowIndex and column name to update the correct cell, because when we pass this into the cell, it memoizes the function and doesn't recognise that the active cell has been set by this point
  const updateCellData = (rowIndex, column, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][column] = value;

    // update the data
    setData(updatedData);
  };

  const fields = data ? Object.keys(data[0]) : [];

  const addNewRow = rowIndex => {
    const updatedData = [...data];
    const generatedRow = fields.reduce((acc, field) => {
      acc[field] = '';
      return acc;
    }, {});
    updatedData.splice(rowIndex, 0, generatedRow);

    setData(updatedData);
  };

  const removeRow = rowIndex => {
    const updatedData = [...data];
    updatedData.splice(rowIndex, 1);
    setData(updatedData);
  };

  const setCellActiveState = cell => {
    setActiveCell(cell);
    setEditMode(false);
  };

  const columns = [
    {
      key: 'id',
      title: '',
      width: 60,
      align: 'center',
      frozen: true,
      cellRenderer: props => (
        <RowHeaderCell {...props} addNewRow={addNewRow} removeRow={removeRow} />
      ),
    },
    ...fields.map(column => ({
      key: column,
      title: column,
      width: 150,
      resizable: true,
      dataKey: column,
      cellRenderer: props => (
        <EditableCell
          {...props}
          activeCell={activeCell}
          setActiveCell={setCellActiveState}
          editMode={editMode}
          setEditMode={setEditMode}
          column={column}
          onChangeCellData={updateCellData}
          container={tableContainerRef}
        />
      ),
    })),
  ];

  const rowData = data ? data.map(row => ({ ...row, id: Math.random() * 1000 })) : [];

  return (
    <Wrapper>
      <EditField
        id="editable-field"
        activeCell={activeCell}
        onChange={updateCellData}
        cellData={rowData[activeCell?.rowIndex]?.[activeCell?.column] ?? ''}
      />

      <TableContainer ref={tableContainerRef}>
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable
              data={rowData}
              columns={columns}
              maxHeight={height}
              width={width}
              headerHeight={30}
              rowHeight={30}
              fixed
              ignoreFunctionInColumnCompare={false} // to allow the cells to receive updated props and re-render
            >
              {columns.map(column => (
                <Column key={column.id} {...column} />
              ))}
            </BaseTable>
          )}
        </AutoResizer>
      </TableContainer>
    </Wrapper>
  );
};

Spreadsheet.propTypes = {
  data: PropTypes.array,
  setData: PropTypes.func.isRequired,
};

Spreadsheet.defaultProps = {
  data: [],
};
