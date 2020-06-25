/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import { fetchStateShape } from '../hooks';

export const FetchLoader = ({ children, state }) => {
  const { isLoading, count, isError, errorMessage } = state;
  if (isLoading) {
    return 'Loading...';
  } else if (isError) {
    return errorMessage;
  } else if (count === 0) {
    return 'There are no messages';
  }

  return children;
};

FetchLoader.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
