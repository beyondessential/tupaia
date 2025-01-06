/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/**
 * Utility hook for managing cell filters in the URL, to prevent multiple updates to the URL for the same filter
 */
export const useColumnFilters = (defaultFilters = []) => {
  const [defaults, setDefaults] = useState(defaultFilters);
  const location = useLocation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const urlFilters = urlSearchParams.get('filters');
  const filters = urlFilters ? JSON.parse(urlFilters) : defaults;

  const onChangeFilters = newFilters => {
    // Check if the cleaned filters are the same as current filters
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) return;

    // Clear the defaults if the filters are being updated
    setDefaults([]);

    // Remove filters with empty values
    const updatedFilters = newFilters.filter(filter => filter.value !== '');

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
