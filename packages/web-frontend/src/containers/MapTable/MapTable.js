import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';
import { selectRenderedMeasuresWithDisplayInfo } from '../../selectors';

const TableContainer = styled(MuiTableContainer)`
  //background: black;
`;

const getValue = (row, key, valueMapping) => {
  const value = row[key];

  if (value === undefined) {
    return 'No Data';
  }

  const formattedValue = valueMapping[value];

  if (formattedValue === undefined) {
    return 'No Data';
  }

  return formattedValue.name;
};

export const MapTableComponent = ({ measureOptions, measureData }) => {
  if (!measureData) {
    return null;
  }

  return (
    <TableContainer>
      <StyledTable>
        <MuiTableHead>
          <MuiTableRow>
            <MuiTableCell>Name</MuiTableCell>
            {measureOptions.map(({ key, name }) => (
              <MuiTableCell key={key}>{name}</MuiTableCell>
            ))}
            <MuiTableCell>Submission Date</MuiTableCell>
          </MuiTableRow>
        </MuiTableHead>
        <MuiTableBody>
          {measureData.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MuiTableRow key={index}>
              <MuiTableCell component="th" scope="row">
                {row.name}
              </MuiTableCell>
              {measureOptions.map(({ key, valueMapping }) => {
                return <MuiTableCell key={key}>{getValue(row, key, valueMapping)}</MuiTableCell>;
              })}
              <MuiTableCell scope="row">
                {row.submissionDate ? row.submissionDate : 'No Data'}
              </MuiTableCell>
            </MuiTableRow>
          ))}
        </MuiTableBody>
      </StyledTable>
    </TableContainer>
  );
};

const mapStateToProps = state => {
  const { measureOptions } = state.map.measureInfo;

  const measureData = selectRenderedMeasuresWithDisplayInfo(state);

  return {
    measureOptions,
    measureData,
  };
};

export const MapTable = connect(mapStateToProps)(MapTableComponent);
