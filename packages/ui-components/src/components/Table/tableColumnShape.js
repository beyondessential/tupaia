import PropTypes from 'prop-types';

export const tableColumnShape = {
  key: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  accessor: PropTypes.func,
  CellComponent: PropTypes.any,
  sortable: PropTypes.bool,
};
