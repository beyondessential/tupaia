/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { StyledTableRow, TableCell } from '@tupaia/ui-components';

const StyledNoDataRow = styled(StyledTableRow)`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  height: 10rem;

  &:hover {
    background: white;
  }

  .MuiTableCell-root {
    text-align: center;
    padding-bottom: 1rem;
    color: ${props => props.theme.palette.text.tertiary};
  }

  .MuiSvgIcon-root {
    font-size: 1.8rem;
    margin-bottom: 0.2rem;
  }
`;

export const NoDataRow = ({ colSpan }) => (
  <StyledNoDataRow>
    <TableCell colSpan={colSpan}>
      <InfoIcon />
      <Typography variant="h4">No data</Typography>
    </TableCell>
  </StyledNoDataRow>
);

NoDataRow.propTypes = {
  colSpan: PropTypes.number.isRequired,
};
