/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import BaseTable from 'react-base-table';
import 'react-base-table/styles.css';
import { EditableCell } from './EditableCell';
import { EditField } from './EditField';
import { useSpreadsheetJSON } from './useSpreadsheetJSON';

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
  const editFieldRef = useRef();
  const [activeCell, setActiveCell] = useState(null);
  const { json, setJson } = useSpreadsheetJSON(survey?.id, open, currentFile);

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
        <EditField
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
