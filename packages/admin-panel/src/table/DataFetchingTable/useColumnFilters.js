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
    // Remove filters with empty values
    const updatedFilters = newFilters.filter(filter => filter.value !== '');

    // Check if the cleaned filters are the same as current filters
    if (JSON.stringify(updatedFilters) === JSON.stringify(filters)) return;

    if (updatedFilters.length === 0) {
      // If there are no filters left, delete the filters key
      urlSearchParams.delete('filters');
    } else {
      // Update the filters key in the URL
      urlSearchParams.set('filters', JSON.stringify(updatedFilters));
    }

    setUrlSearchParams(urlSearchParams, {
      state: location.state,
    });
  };
  return {
    filters,
    onChangeFilters,
  };
};
