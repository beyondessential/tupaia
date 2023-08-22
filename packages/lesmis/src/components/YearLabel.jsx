import React from 'react';
import PropTypes from 'prop-types';

import { DEFAULT_DATA_YEAR } from '../constants';
import { useIsFavouriteDashboardSelected } from '../utils';

// TODO: will be removed when implementing year selector for favourite dashboard
export const YearLabel = ({ useYearSelector }) => {
  const isFavouriteDashboardSelected = useIsFavouriteDashboardSelected();

  if (!isFavouriteDashboardSelected || !useYearSelector) {
    return null;
  }

  return <span style={{ margin: 'auto', fontWeight: 500 }}>{DEFAULT_DATA_YEAR}</span>;
};

YearLabel.propTypes = {
  useYearSelector: PropTypes.bool,
};

YearLabel.defaultProps = {
  useYearSelector: false,
};
