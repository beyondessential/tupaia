import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiTableBody from '@material-ui/core/TableBody';
import { ControlledExpandableTableRow, tableColumnShape } from '@tupaia/ui-components';
import { setActiveCountryWeek } from '../../store';

const TableBodyComponent = React.memo(
  ({ data, columns, SubComponent, activeCountryWeekId, toggleTableRow }) => (
    <MuiTableBody>
      {data.map((rowData, rowIndex) => {
        const key = rowData.index; // todo: use real id
        const expanded = activeCountryWeekId === key;
        const handleRowClick = () => {
          toggleTableRow(key);
        };
        return (
          <ControlledExpandableTableRow
            onClick={handleRowClick}
            expanded={expanded}
            data={data}
            rowIndex={rowIndex}
            key={rowData.id}
            columns={columns}
            SubComponent={SubComponent}
          />
        );
      })}
    </MuiTableBody>
  ),
);

TableBodyComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(tableColumnShape)).isRequired,
  data: PropTypes.array.isRequired,
  SubComponent: PropTypes.any,
  activeCountryWeekId: PropTypes.number,
  toggleTableRow: PropTypes.func.isRequired,
};

TableBodyComponent.defaultProps = {
  SubComponent: null,
  activeCountryWeekId: null,
};

const mapStateToProps = state => ({
  activeCountryWeekId: state.weeklyReports.activeCountryWeekId,
});

const mapDispatchToProps = dispatch => ({
  toggleTableRow: key => dispatch(setActiveCountryWeek(key)),
});

export const CountryTableBody = connect(mapStateToProps, mapDispatchToProps)(TableBodyComponent);
