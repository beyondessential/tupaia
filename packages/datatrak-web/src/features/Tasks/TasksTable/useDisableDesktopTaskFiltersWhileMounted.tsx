import { useEffect, useState } from 'react';
import { ROUTES } from '../../../constants';
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

  useEffect(() => {
    setShowAllAssignees(false);
    setShowCancelled(true);
    setShowCompleted(true);

    return () => {
      // HACK: We’re after the pathname’s value when this cleanup function runs, not when it’s
      // scheduled. Using `useLocation` or `useMatch` gives us an outdated value.
      if (window.location.pathname.startsWith(ROUTES.TASKS)) {
        // Restore previous settings
        setShowAllAssignees(allAssignees);
        setShowCancelled(cancelled);
        setShowCompleted(completed);
      }
    };
  }, [allAssignees, cancelled, completed, setShowAllAssignees, setShowCancelled, setShowCompleted]);
}
