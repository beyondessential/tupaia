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
import { setActiveCountryWeek } from '../../store';

const TableBodyComponent = React.memo(({ data, columns, activeCountryWeekId, toggleTableRow }) => (
  <MuiTableBody>
    {data.map((rowData, rowIndex) => {
      const key = rowData.index; // todo: use real id
      const expanded = activeCountryWeekId === key;

      const handleRowClick = () => {
        if (expanded) {
          toggleTableRow(null);
        } else {
          toggleTableRow(key);
        }
      };
      return (
        <ExpandableTableRow
          onClick={handleRowClick}
          expandedValue={expanded}
          data={data}
          rowIndex={rowIndex}
          key={rowData.id} // todo: update to key when real data is in place
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
  activeCountryWeekId: PropTypes.number,
  toggleTableRow: PropTypes.func.isRequired,
};

TableBodyComponent.defaultProps = {
  activeCountryWeekId: null,
};

const mapStateToProps = state => ({
  activeCountryWeekId: state.weeklyReports.activeCountryWeekId,
});

const mapDispatchToProps = dispatch => ({
  toggleTableRow: key => dispatch(setActiveCountryWeek(key)),
});

export const CountryTableBody = connect(mapStateToProps, mapDispatchToProps)(TableBodyComponent);
