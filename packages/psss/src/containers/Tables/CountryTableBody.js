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
import { setActiveWeek, getActiveWeekId } from '../../store';

const TableBodyComponent = React.memo(({ data, columns, activeWeekId, toggleTableRow }) => (
  <MuiTableBody>
    {data.map((rowData, rowIndex) => {
      const key = rowData.index; // todo: use real id
      const expanded = activeWeekId === key;

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
          rowData={rowData}
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
  activeWeekId: PropTypes.number,
  toggleTableRow: PropTypes.func.isRequired,
};

TableBodyComponent.defaultProps = {
  activeWeekId: null,
};

const mapStateToProps = state => ({
  activeWeekId: getActiveWeekId(state),
});

const mapDispatchToProps = dispatch => ({
  toggleTableRow: key => dispatch(setActiveWeek(key)),
});

export const CountryTableBody = connect(mapStateToProps, mapDispatchToProps)(TableBodyComponent);
