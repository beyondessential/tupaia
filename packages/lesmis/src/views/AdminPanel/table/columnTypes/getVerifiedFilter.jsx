import React from 'react';
import PropTypes from 'prop-types';
import { Select } from '@tupaia/ui-components';

export const getVerifiedFilter = translate => {
  const VerifiedFilter = ({ filter, onChange, column }) => (
    <Select
      id={column.id}
      options={[
        { label: 'Show All', value: '' },
        { label: translate('admin.yes'), value: 'verified' },
        { label: translate('admin.no'), value: 'new_user' },
        { label: translate('admin.notApplicable'), value: 'unverified' },
      ]}
      onChange={event => onChange(event.target.value)}
      value={filter ? filter.value : ''}
    />
  );

  VerifiedFilter.propTypes = {
    column: PropTypes.PropTypes.shape({
      id: PropTypes.string,
    }),
    filter: PropTypes.PropTypes.shape({
      value: PropTypes.string,
    }),
    onChange: PropTypes.func,
  };

  VerifiedFilter.defaultProps = {
    filter: null,
    onChange: null,
    column: {},
  };

  return VerifiedFilter;
};
