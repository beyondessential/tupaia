import { useEffect } from 'react';
import { useTasksTable } from './TasksTable';

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
