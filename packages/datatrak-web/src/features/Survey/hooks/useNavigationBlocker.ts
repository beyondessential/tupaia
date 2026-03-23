import { useContext, useEffect, useCallback, useRef } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import type { History } from 'history';

type Navigator = Pick<History, 'go' | 'push' | 'replace' | 'createHref'>;

/**
 * Intercepts in-app navigation (push, replace, go) via UNSAFE_NavigationContext.
 * When `active` is true and a navigation attempt occurs, it calls `onBlock` instead
 * of navigating. Call the returned `proceed` function to perform the blocked navigation.
 *
 * This is a workaround for react-router v6.3 which doesn't expose useBlocker.
 */
export function useNavigationBlocker(active: boolean, onBlock: () => void) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  const blockedNavigation = useRef<(() => void) | null>(null);

  const onBlockRef = useRef(onBlock);
  onBlockRef.current = onBlock;

  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active) {
      blockedNavigation.current = null;
      return;
    }

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;

    navigator.push = (...args: Parameters<Navigator['push']>) => {
      if (activeRef.current) {
        blockedNavigation.current = () => originalPush.apply(navigator, args);
        onBlockRef.current();
      } else {
        originalPush.apply(navigator, args);
      }
    };

    navigator.replace = (...args: Parameters<Navigator['replace']>) => {
      if (activeRef.current) {
        blockedNavigation.current = () => originalReplace.apply(navigator, args);
        onBlockRef.current();
      } else {
        originalReplace.apply(navigator, args);
      }
    };

    navigator.go = (...args: Parameters<Navigator['go']>) => {
      if (activeRef.current) {
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

  /** Temporarily disable blocking so the next navigation passes through unimpeded. */
  const disable = useCallback(() => {
    activeRef.current = false;
  }, []);

  return { proceed, reset, disable };
}
