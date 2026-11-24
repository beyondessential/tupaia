import { useCallback } from 'react';
import { To, useNavigate } from 'react-router';

import { ROUTES } from '../constants';

/**
 * React Router’s position in the browser history (`history.state.idx`) when this page load began.
 *
 * Recorded when this module is first evaluated, which is while the app’s modules load, before it
 * renders and before any navigation. React Router keeps `idx` in the history entry itself, so it
 * survives a reload: after one, the entries before this position still look like the app’s own,
 * but they belong to the earlier page load (or to another site).
 *
 * `idx` is React Router’s own bookkeeping rather than documented API. If a future version drops it,
 * this falls back to 0, and the back button below then always goes to its fallback: never a
 * restart, just not back to the previous page.
 */
const historyIndexAtLoad: number = window.history.state?.idx ?? 0;

/**
 * A back button that stays within this page load.
 *
 * Going back to an entry from an earlier page load makes the browser load the app again from
 * scratch, which restarts everything, database included. Anything that reloads the app leaves such
 * entries behind: the update prompt, the offline page’s refresh, a data mode switch. So go back
 * only to a page visited since this page load began, and otherwise go to `fallback` instead.
 */
export const useGoBack = (fallback: To = ROUTES.HOME) => {
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > historyIndexAtLoad) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, fallback]);
};
