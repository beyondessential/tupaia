import { useEffect, useState } from 'react';
import { getTaskFilterSetting, setTaskFilterSetting } from '../../../utils';

/** Use this effectful hook when these filters aren’t visible or configurable in the GUI. */
export function useDisableDesktopTaskFiltersWhileMounted() {
  // Get current settings, to be restored upon unmount
  const [allAssignees] = useState(getTaskFilterSetting('all_assignees_tasks'));
  const [showCancelled] = useState(getTaskFilterSetting('show_cancelled_tasks'));
  const [showCompleted] = useState(getTaskFilterSetting('show_completed_tasks'));

  // When calling component mounts, set sensible defaults
  useEffect(() => {
    setTaskFilterSetting('all_assignees_tasks', false);
    setTaskFilterSetting('show_cancelled_tasks', true);
    setTaskFilterSetting('show_completed_tasks', true);
  }, []);

  useEffect(() => {
    return () => {
      // Restore previous settings
      setTaskFilterSetting('all_assignees_tasks', allAssignees);
      setTaskFilterSetting('show_cancelled_tasks', showCancelled);
      setTaskFilterSetting('show_completed_tasks', showCompleted);
    };
  }, [allAssignees, showCancelled, showCompleted]);
}
