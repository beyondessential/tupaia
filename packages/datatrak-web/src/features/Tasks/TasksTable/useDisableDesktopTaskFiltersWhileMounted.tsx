import { useEffect, useState } from 'react';
import { useTasksTable } from './useTasksTable';

/**
 * Use this effectful hook when these filters aren’t visible or configurable in the GUI. This hook
 * prevents the scenario where the toggles’ effect are applied (with state stored in search params)
 * whilst the toggles aren’t mounted (e.g. due to a change to the viewport’s size class).
 */
export function useDisableDesktopTaskFiltersWhileMounted() {
  const {
    showAllAssignees,
    setShowAllAssignees,
    showCancelled,
    setShowCancelled,
    showCompleted,
    setShowCompleted,
  } = useTasksTable();

  // Get current settings, to be restored upon unmount
  const [allAssignees] = useState(showAllAssignees);
  const [cancelled] = useState(showCancelled);
  const [completed] = useState(showCompleted);

  // When calling component mounts, set sensible defaults
  useEffect(
    () => {
      setShowAllAssignees(false);
      setShowCancelled(true);
      setShowCompleted(true);
    },
    // Effect is idempotent, so exhaustively declaring dependencies is actually optional
    [setShowAllAssignees, setShowCancelled, setShowCompleted],
  );

  useEffect(
    () => {
      return () => {
        // Restore previous settings
        setShowAllAssignees(allAssignees);
        setShowCancelled(cancelled);
        setShowCompleted(completed);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Expressly want cleanup function to run only when caller unmounts
    [],
  );
}
