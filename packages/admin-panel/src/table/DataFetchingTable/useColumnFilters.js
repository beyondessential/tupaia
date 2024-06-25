/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useSearchParams } from 'react-router-dom';

/**
 * Utility hook for managing cell filters in the URL, to prevent multiple updates to the URL for the same filter
 */
export const useColumnFilters = (defaultFilters = []) => {
  const location = useLocation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const urlFilters = urlSearchParams.get('filters');
  const filters = urlFilters ? JSON.parse(urlFilters) : defaultFilters;

  const onChangeFilters = newFilters => {
    // if the filters are the same, don't update the URL
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) return;

    if (newFilters.length === 0) {
      // if there are filters in the URL, delete the filters key
      urlSearchParams.delete('filters');

      setUrlSearchParams(urlSearchParams, {
        state: location.state,
      });
      return;
    }

    // update the filters key in the URL
    urlSearchParams.set('filters', JSON.stringify(newFilters));
    setUrlSearchParams(urlSearchParams, {
      state: location.state,
    });
  };
  return {
    filters,
    onChangeFilters,
  };
};
