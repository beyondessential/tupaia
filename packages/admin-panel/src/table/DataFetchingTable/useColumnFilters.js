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

  const getUpdatedFilters = (id, value) => {
    if (value === '' || value === undefined) {
      return filters.filter(f => f.id !== id);
    }
    const existingFilter = filters.find(f => f.id === id);
    if (existingFilter) {
      return filters.map(f => (f.id === id ? { ...f, value } : f));
    }
    return [...filters, { id, value }];
  };

  const onChangeFilter = (id, value) => {
    const updatedFilters = getUpdatedFilters(id, value);
    // if the filters are the same, don't update the URL
    if (JSON.stringify(updatedFilters) === JSON.stringify(filters)) return;

    if (updatedFilters.length === 0) {
      // if there are filters in the URL, delete the filters key
      urlSearchParams.delete('filters');

      setUrlSearchParams(urlSearchParams);
      return;
    }

    // update the filters key in the URL
    setUrlSearchParams(
      { filters: JSON.stringify(updatedFilters) },
      {
        state: location.state, // keep the state the same so that if a search filter is applied to a nested view, when the user goes back, the previous page's search filter is still applied
      },
    );
  };
  return {
    filters,
    onChangeFilter,
  };
};
