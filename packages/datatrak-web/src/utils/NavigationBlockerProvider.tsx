import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import type { History, To } from 'history';

type Navigator = Pick<History, 'go' | 'push' | 'replace' | 'createHref'>;

function getPathname(to: To): string | undefined {
  if (typeof to === 'string') return to;
  return to.pathname ?? undefined;
}

export interface BlockerHandler {
  id: number;
  active: boolean;
  shouldBlock?: (pathname: string) => boolean;
  onBlock: () => void;
  /** Stored navigation action to execute when blocker calls proceed() */
  blockedNavigation: (() => void) | null;
}

interface NavigationBlockerContextType {
  /** Register a navigation blocker. Returns an unregister callback. */
  registerBlocker: (handler: Omit<BlockerHandler, 'id' | 'blockedNavigation'>) => {
    id: number;
    unregister: () => void;
    proceed: () => void;
    reset: () => void;
  };
  /** Disable all registered navigation blockers. */
  disableAll: () => void;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType>({
  registerBlocker: () => ({
    id: 0,
    unregister: () => {},
    proceed: () => {},
    reset: () => {},
  }),
  disableAll: () => {},
});

export const NavigationBlockerProvider = ({ children }: { children: React.ReactNode }) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const blockersRef = useRef(new Map<number, BlockerHandler>());
  const nextIdRef = useRef(0);
  const patchedRef = useRef(false);

  // Centralized navigator patching — happens once when first blocker registers
  useEffect(() => {
    if (patchedRef.current) return;
    patchedRef.current = true;

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;

    const interceptPushOrReplace =
      (original: Navigator['push'] | Navigator['replace']) =>
      (...args: Parameters<Navigator['push']>) => {
        const pathname = getPathname(args[0]);

        // Check all active blockers in registration order
        const blockers = Array.from(blockersRef.current.values());
        for (const blocker of blockers) {
          if (!blocker.active) continue;

          const shouldBlock = pathname && blocker.shouldBlock
            ? blocker.shouldBlock(pathname)
            : true;

          if (shouldBlock) {
            blocker.blockedNavigation = () => original.apply(navigator, args);
            blocker.onBlock();
            return; // Block navigation
          }
        }

        // No active blocker matched — allow navigation
        original.apply(navigator, args);
      };

    navigator.push = interceptPushOrReplace(originalPush);
    navigator.replace = interceptPushOrReplace(originalReplace);

    navigator.go = (...args: Parameters<Navigator['go']>) => {
      // go() (browser back/forward) is always blocked if any blocker is active
      const blockers = Array.from(blockersRef.current.values());
      for (const blocker of blockers) {
        if (blocker.active) {
          blocker.blockedNavigation = () => originalGo.apply(navigator, args);
          blocker.onBlock();
          return;
        }
      }

      originalGo.apply(navigator, args);
    };

    // Restore on unmount
    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
      navigator.go = originalGo;
      patchedRef.current = false;
    };
  }, [navigator]);

  const registerBlocker = useCallback(
    (handler: Omit<BlockerHandler, 'id' | 'blockedNavigation'>) => {
      const id = nextIdRef.current++;
      const blocker: BlockerHandler = { ...handler, id, blockedNavigation: null };
      blockersRef.current.set(id, blocker);

      const unregister = () => {
        blockersRef.current.delete(id);
      };

      const proceed = () => {
        const nav = blocker.blockedNavigation;
        blocker.blockedNavigation = null;
        nav?.();
      };

      const reset = () => {
        blocker.blockedNavigation = null;
      };

      return { id, unregister, proceed, reset };
    },
    [],
  );

  const disableAll = useCallback(() => {
    blockersRef.current.forEach(blocker => {
      blocker.active = false;
    });
  }, []);

  const value = React.useMemo(
    () => ({ registerBlocker, disableAll }),
    [registerBlocker, disableAll],
  );

  return (
    <NavigationBlockerContext.Provider value={value}>{children}</NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlockerContext = () => useContext(NavigationBlockerContext);
