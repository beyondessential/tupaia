import React from 'react';
import { Select } from '@tupaia/ui-components';
import PropTypes from 'prop-types';

export const getBooleanSelectFilter = translate => {
  const BooleanSelectFilter = ({ filter, onChange, column }) => (
    <Select
      id={column.id}
      options={[
        { label: translate('admin.showAll'), value: '' },
        { label: translate('admin.yes'), value: true },
        { label: translate('admin.no'), value: false },
      ]}
      onChange={event => onChange(event.target.value)}
      value={filter ? filter.value : ''}
    />
  );

  BooleanSelectFilter.propTypes = {
    column: PropTypes.PropTypes.shape({
      id: PropTypes.string,
    }),
    filter: PropTypes.PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    }),
    onChange: PropTypes.func,
  };

  BooleanSelectFilter.defaultProps = {
    filter: null,
    onChange: null,
    column: {},
  };

  return BooleanSelectFilter;
};
