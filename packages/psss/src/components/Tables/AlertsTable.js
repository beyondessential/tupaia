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
import { CountryNameCell, WeekAndDateCell } from './TableCellComponents';

const SyndromeCellContainer = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

const SyndromeCell = ({ syndrome }) => <SyndromeCellContainer>{syndrome}</SyndromeCellContainer>;

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
    width: '28%',
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
    width: '180px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '115px',
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
    width: '50px',
  },
];

export const AlertsTable = React.memo(() => <ConnectedTable endpoint="alerts" columns={columns} />);
