/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';

/*
 * Simple Table
 */
const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export const SimpleTable = () => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/*
 * Zebra Table
 */
function createZebraData(name, sites, afr, dia, ili, pf, dli, status) {
  return { name, sites, afr, dia, ili, pf, dli, status };
}

const zebraRows = [
  createZebraData('Sentinel Site 1', '6/30', '6', '15', '15', '15', '15', ''),
  createZebraData('Sentinel Site 2', '6/30', '6', '15', '15', '15', '15', ''),
  createZebraData('Sentinel Site 3', '6/30', '6', '15', '15', '15', '15', ''),
  createZebraData('Sentinel Site 4', '6/30', '6', '15', '15', '15', '15', ''),
  createZebraData('Sentinel Site 5', '6/30', '6', '15', '15', '15', '15', ''),
  createZebraData('Sentinel Site 6', '6/30', '6', '15', '15', '15', '15', ''),
];

const ZebraTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    background-color: #efefef;
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const ZebraContainer = styled.div`
  background: #ffffff;
  border: 1px solid #dedee0;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding: 1.5rem 1rem;
`;

export const ZebraTable = () => (
  <ZebraContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Week 6</TableCell>
          <TableCell align="right">Sites Reported</TableCell>
          <TableCell align="right">AFR</TableCell>
          <TableCell align="right">DIA</TableCell>
          <TableCell align="right">ILI</TableCell>
          <TableCell align="right">PF</TableCell>
          <TableCell align="right">DLI</TableCell>
          <TableCell align="right">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {zebraRows.map(row => (
          <ZebraTableRow key={row.name}>
            <TableCell component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="right">{row.sites}</TableCell>
            <TableCell align="right">{row.afr}</TableCell>
            <TableCell align="right">{row.dia}</TableCell>
            <TableCell align="right">{row.ili}</TableCell>
            <TableCell align="right">{row.pf}</TableCell>
            <TableCell align="right">{row.dli}</TableCell>
            <TableCell align="right">{row.status}</TableCell>
          </ZebraTableRow>
        ))}
      </TableBody>
    </Table>
  </ZebraContainer>
);

/*
 * Card Table
 */
export const CardTable = () => (
  <Table>
    <TableBody>
      {rows.map(row => (
        <TableRow key={row.name}>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell align="right">{row.carbs}</TableCell>
          <TableCell align="right">{row.protein}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
