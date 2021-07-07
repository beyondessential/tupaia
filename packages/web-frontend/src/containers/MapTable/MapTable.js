import React from 'react';
import styled from 'styled-components';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableBody from '@material-ui/core/TableBody';
import { StyledTable } from './StyledTable';
import { getFormattedInfo } from '../../utils/measures';

const TableContainer = styled(MuiTableContainer)`
  //background: black;
`;

const getValue = (data, measureOption) => {
  const { formattedValue } = getFormattedInfo(data, measureOption);
  return formattedValue;
};

export const MapTable = ({ measureOptions, measureData }) => {
  console.log(JSON.stringify(measureOptions));
  console.log(JSON.stringify(measureData));
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
          {measureData.map((data, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MuiTableRow key={index}>
              <MuiTableCell component="th" scope="row">
                {data.name}
              </MuiTableCell>
              {measureOptions.map(measureOption => {
                return (
                  <MuiTableCell key={measureOption.key}>
                    {getValue(data, measureOption)}
                  </MuiTableCell>
                );
              })}
              <MuiTableCell scope="row">
                {data.submissionDate ? data.submissionDate : 'No Data'}
              </MuiTableCell>
            </MuiTableRow>
          ))}
        </MuiTableBody>
      </StyledTable>
    </TableContainer>
  );
};
