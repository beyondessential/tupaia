/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { IconButton } from '@material-ui/core';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ConnectedTable } from './ConnectedTable';
import { COLUMN_WIDTHS } from './constants';
import { CountryNameCell, WeekAndDateCell } from './TableCellComponents';

const StyledCell = styled.div`
  display: inline-block;
  border-bottom: 1px dotted #6f7b82;
`;

const SyndromeCell = ({ syndrome }) => <StyledCell>{syndrome}</StyledCell>;

SyndromeCell.propTypes = {
  syndrome: PropTypes.string.isRequired,
};

const AlertMenuCell = () => (
  <IconButton>
    <MoreVertIcon />
  </IconButton>
);

const columns = [
  {
    title: 'Country',
    key: 'name',
    width: COLUMN_WIDTHS.FIRST,
    align: 'left',
    CellComponent: CountryNameCell,
  },
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'week',
    align: 'left',
    width: COLUMN_WIDTHS.ALERT_START_DATE,
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
  },
  {
    title: 'Sites Reported',
    key: 'sitesReported',
    align: 'left',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
  },
];

export const AlertsTable = React.memo(() => <ConnectedTable endpoint="alerts" columns={columns} />);
