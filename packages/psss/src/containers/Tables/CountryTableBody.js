/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiTableBody from '@material-ui/core/TableBody';
import { ExpandableTableRow, tableColumnShape } from '@tupaia/ui-components';
import { SiteSummaryTable } from './SiteSummaryTable';
import { setActiveWeek, getActiveWeek } from '../../store';

const TableBodyComponent = React.memo(({ data, columns, activeWeek, toggleTableRow }) => (
  <MuiTableBody>
    {data.map((rowData, rowIndex) => {
      const period = rowData.period;
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
  </MuiTableBody>
));

TableBodyComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  activeWeek: PropTypes.string,
  toggleTableRow: PropTypes.func.isRequired,
};

TableBodyComponent.defaultProps = {
  activeWeek: null,
};

const mapStateToProps = state => ({
  activeWeek: getActiveWeek(state),
});

const mapDispatchToProps = dispatch => ({
  toggleTableRow: period => dispatch(setActiveWeek(period)),
});

export const CountryTableBody = connect(mapStateToProps, mapDispatchToProps)(TableBodyComponent);
