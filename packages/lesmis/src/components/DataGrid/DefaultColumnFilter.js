/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '@tupaia/ui-components';

const StyledTextField = styled(TextField)`
  margin: 0;
`;

export const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => (
  <StyledTextField
    value={filterValue || ''}
    onChange={e => {
      setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
    }}
    placeholder="Search"
  />
);

DefaultColumnFilter.propTypes = {
  column: PropTypes.shape({
    filterValue: PropTypes.string,
    setFilter: PropTypes.func,
  }).isRequired,
};
