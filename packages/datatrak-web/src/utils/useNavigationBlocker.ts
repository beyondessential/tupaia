import { useContext, useEffect, useCallback, useRef } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import type { History, To } from 'history';

type Navigator = Pick<History, 'go' | 'push' | 'replace' | 'createHref'>;

/**
 * Extract the pathname string from a history `To` value (string or partial Path object).
 */
function getPathname(to: To): string | undefined {
  if (typeof to === 'string') return to;
  return to.pathname ?? undefined;
}

export interface NavigationBlockerOptions {
  /** Whether the blocker is active at all. */
  active: boolean;
  /** Called when a navigation is blocked. */
  onBlock: () => void;
  /**
   * Optional predicate called with the destination pathname.
   * Return `true` to block, `false` to allow. Defaults to blocking everything.
   * Not called for `go()` (browser back/forward) — those are always blocked when active.
   */
  shouldBlock?: (pathname: string) => boolean;
}

/**
 * Intercepts in-app navigation (push, replace, go) via UNSAFE_NavigationContext.
 * When active and `shouldBlock` returns true, calls `onBlock` instead of navigating.
 * Call the returned `proceed` function to perform the blocked navigation.
 *
 * This is a workaround for react-router v6.3 which doesn't expose useBlocker.
 */
export function useNavigationBlocker({ active, onBlock, shouldBlock }: NavigationBlockerOptions) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  const blockedNavigation = useRef<(() => void) | null>(null);

  const onBlockRef = useRef(onBlock);
  onBlockRef.current = onBlock;

  const activeRef = useRef(active);
  activeRef.current = active;

  // Separate ref so that disable() survives re-renders (activeRef gets overwritten above)
  const disabledRef = useRef(false);

  const shouldBlockRef = useRef(shouldBlock);
  shouldBlockRef.current = shouldBlock;

  useEffect(() => {
    if (!active) {
      blockedNavigation.current = null;
      return;
    }

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;

    const interceptPushOrReplace =
      (original: Navigator['push'] | Navigator['replace']) =>
      (...args: Parameters<Navigator['push']>) => {
        if (!activeRef.current || disabledRef.current) {
          original.apply(navigator, args);
          return;
        }

        const pathname = getPathname(args[0]);
        if (pathname && shouldBlockRef.current && !shouldBlockRef.current(pathname)) {
          original.apply(navigator, args);
          return;
        }

        blockedNavigation.current = () => original.apply(navigator, args);
        onBlockRef.current();
      };

    navigator.push = interceptPushOrReplace(originalPush);
    navigator.replace = interceptPushOrReplace(originalReplace);

    navigator.go = (...args: Parameters<Navigator['go']>) => {
      if (activeRef.current && !disabledRef.current) {
        blockedNavigation.current = () => originalGo.apply(navigator, args);
        onBlockRef.current();
      } else {
        originalGo.apply(navigator, args);
      }
    };

    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
      navigator.go = originalGo;
    };
  }, [active, navigator]);

  const proceed = useCallback(() => {
    const nav = blockedNavigation.current;
    blockedNavigation.current = null;
    activeRef.current = false;
    nav?.();
    activeRef.current = active;
  }, [active]);

  const reset = useCallback(() => {
    blockedNavigation.current = null;
  }, []);

  /** Durably disable blocking so the next navigation passes through even across re-renders. */
  const disable = useCallback(() => {
    activeRef.current = false;
    disabledRef.current = true;
  }, []);

  return { proceed, reset, disable };
}
