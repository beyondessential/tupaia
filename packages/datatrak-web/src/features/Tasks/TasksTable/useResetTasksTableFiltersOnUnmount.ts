import { useEffect } from 'react';
import { useTasksTable } from './useTasksTable';

/**
 * @privateRemarks This hook exists only because the mobile and desktop layouts use different
 * filtering logic which aren’t easily mapped to each other. Ideally, both would use the same schema
 * and use URI search params as the source of truth. For now, we simply reset filters when switching
 * between the two layouts. This prevents a situation where a filter is applied by a component that
 * is no longer in the DOM, ensuring state is always reflected by the GUI.
 */
export function useResetTasksTableFiltersOnUnmount() {
  const { updateFilters } = useTasksTable();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // We want to reset filters only when the calling component actually unmounts. Declaring
  // `updateFilters` as a dependency would cause the cleanup function to be scheduled before the
  // (empty) Effect runs, which would interfere with the filters’ functionality.
  useEffect(() => {
    return () => updateFilters([]);
  }, []);
}
