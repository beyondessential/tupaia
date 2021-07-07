import React from 'react';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';
import { FlexCenter } from '../../components/Flexbox';

const TableContainer = styled(MuiTableContainer)`
  //background: black;
`;

const Box = styled.span`
  display: block;
  width: 1em;
  height: 1em;
  margin-right: 0.6em;
  border-radius: 3px;
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

  // if (row.color) {
  //   return (
  //     <FlexCenter>
  //       <Box style={{ background: row.color }} />
  //       {formattedValue.name}
  //     </FlexCenter>
  //   );
  // }

  return formattedValue.name;
};

export const MapTable = ({ measureOptions, measureData }) => {
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
