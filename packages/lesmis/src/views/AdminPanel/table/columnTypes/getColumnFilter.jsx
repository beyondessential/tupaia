import PropTypes from 'prop-types';
import React from 'react';

import { TextField } from '../../../../components/TextField';

export const getColumnFilter = translate => {
  const ColumnFilter = ({ filter, onChange }) => (
    <TextField
      type="text"
      placeholder={translate('admin.typeToFilter')}
      value={filter ? filter.value : ''}
      onChange={event => onChange(event.target.value)}
    />
  );
  ColumnFilter.propTypes = {
    filter: PropTypes.PropTypes.shape({
      value: PropTypes.string,
    }),
    onChange: PropTypes.func,
  };

  ColumnFilter.defaultProps = {
    filter: null,
    onChange: null,
  };

  return ColumnFilter;
};
