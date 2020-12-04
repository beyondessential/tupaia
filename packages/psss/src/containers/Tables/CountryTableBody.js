/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiTableBody from '@material-ui/core/TableBody';
import { ExpandableTableRow, tableColumnShape } from '@tupaia/ui-components';
import { SiteSummaryTable } from './SiteSummaryTable';
import { setActiveWeek, getActiveWeek } from '../../store';

const StyledTableBody = styled(MuiTableBody)`
  pointer-events: ${props => (props.isfetching ? 'none' : 'initial')};
  opacity: ${props => (props.isfetching ? '0.5' : 1)};
`;

const TableBodyComponent = React.memo(
  ({ data, columns, activeWeek, toggleTableRow, isFetching }) => (
    <StyledTableBody isfetching={isFetching}>
      {data.map((rowData, rowIndex) => {
        const { period } = rowData;
        const expanded = activeWeek === period;

        const handleRowClick = () => {
          if (expanded) {
            toggleTableRow(null);
          } else {
            toggleTableRow(period);
          }
        };

        return (
          <ExpandableTableRow
            onClick={handleRowClick}
            expandedValue={expanded}
            rowData={rowData}
            rowIndex={rowIndex}
            key={rowData.period}
            columns={columns}
            SubComponent={SiteSummaryTable}
          />
        );
      })}
    </StyledTableBody>
  ),
);

TableBodyComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  activeWeek: PropTypes.string,
  toggleTableRow: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

TableBodyComponent.defaultProps = {
  activeWeek: null,
  isFetching: false,
};

const mapStateToProps = state => ({
  activeWeek: getActiveWeek(state),
});

const mapDispatchToProps = dispatch => ({
  toggleTableRow: period => dispatch(setActiveWeek(period)),
});

export const CountryTableBody = connect(mapStateToProps, mapDispatchToProps)(TableBodyComponent);
