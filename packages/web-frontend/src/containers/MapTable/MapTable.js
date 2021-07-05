import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';

const TableContainer = styled(MuiTableContainer)`
  position: absolute;
  top: 0;
  left: 0;
  width: 1000px;
  background: black;
  overflow: auto;
  pointer-events: none;
`;

const COLUMN_BLACKLIST = ['submissionDate', 'dataElementCode'];

const getColumns = data => {
  const columns = [];
  data.forEach(row => {
    Object.keys(row)
      .filter(key => !COLUMN_BLACKLIST.includes(key)) // Don't show columns that don't make sense
      .filter(key => !columns.includes(key)) // de-dupe
      .filter(key => typeof row[key] !== 'object') // filter out object values such as metadata
      .forEach(key => {
        columns.push(key); // Finally add column to table
      });
  });

  return columns;
};

export const MapTableComponent = ({ measureData }) => {
  if (!measureData) {
    return null;
  }
  const columns = getColumns(measureData);
  const xName = 'submissionDate';

  return (
    <TableContainer>
      <StyledTable>
        <MuiTableHead>
          <MuiTableRow>
            <MuiTableCell width={250}>{xName || null}</MuiTableCell>
            {columns.map(column => (
              <MuiTableCell key={column}>{column}</MuiTableCell>
            ))}
          </MuiTableRow>
        </MuiTableHead>
        <MuiTableBody>
          {measureData.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MuiTableRow key={index}>
              <MuiTableCell component="th" scope="row">
                {row.submissionDate}
              </MuiTableCell>
              {columns.map(columnKey => {
                const value = row[columnKey];
                const rowValue = value === undefined ? 'No Data' : value;
                return <MuiTableCell key={columnKey}>{rowValue}</MuiTableCell>;
              })}
            </MuiTableRow>
          ))}
        </MuiTableBody>
      </StyledTable>
    </TableContainer>
  );
};

const mapStateToProps = state => {
  const { measureInfo } = state.map;
  const { measureData } = measureInfo;
  console.log('measure data', JSON.stringify(measureData));

  return {
    measureData,
  };
};

export const MapTable = connect(mapStateToProps)(MapTableComponent);
