/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import { fetchStateShape } from '../hooks';

export const FetchLoader = ({ children, state, noDataMessage }) => {
  const { isLoading, count, isError, errorMessage } = state;
  if (isLoading) {
    return 'Loading...';
  }
  if (isError) {
    return errorMessage;
  }
  if (count === 0) {
    return noDataMessage;
  }

  return children;
};

FetchLoader.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
  noDataMessage: PropTypes.string,
};

FetchLoader.defaultProps = {
  noDataMessage: 'No results',
};
