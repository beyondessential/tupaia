import { useEffect, useRef } from 'react';
import { useNavigationBlockerContext } from './NavigationBlockerProvider';

export interface NavigationBlockerOptions {
  /** Whether the blocker is active at all. */
  active: boolean;
  /** Called when a navigation is blocked. */
  onBlock: () => void;
  /**
   * Optional predicate called with the destination pathname.
   * Return `true` to block, `false` to allow. Defaults to blocking everything.
   * For `go()` (browser back/forward), blockers with a `shouldBlock` predicate are
   * skipped since the target pathname can't be resolved from a numeric delta.
   */
  shouldBlock?: (pathname: string) => boolean;
}

/**
 * Intercepts in-app navigation (push, replace, go) via centralized NavigationBlockerProvider.
 * When active and `shouldBlock` returns true, calls `onBlock` instead of navigating.
 * Call the returned `proceed` function to perform the blocked navigation.
 *
 * This is a workaround for react-router v6.3 which doesn't expose useBlocker.
 * TODO: replace with useBlocker() on react-router upgrade
 */
export function useNavigationBlocker({ active, onBlock, shouldBlock }: NavigationBlockerOptions) {
  const { registerBlocker, disableAll } = useNavigationBlockerContext();

  const onBlockRef = useRef(onBlock);
  onBlockRef.current = onBlock;

  const shouldBlockRef = useRef(shouldBlock);
  shouldBlockRef.current = shouldBlock;

  const blockerRef = useRef<{
    unregister: () => void;
    proceed: () => void;
    reset: () => void;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      blockerRef.current?.unregister();
      blockerRef.current = null;
      return;
    }

    // Register with centralized provider
    const blocker = registerBlocker({
      active: true,
      onBlock: () => onBlockRef.current(),
      shouldBlock: shouldBlockRef.current,
    });

    blockerRef.current = blocker;

    return () => {
      blocker.unregister();
    };
  }, [active, registerBlocker]);

  const proceed = () => {
    blockerRef.current?.proceed();
  };

  const reset = () => {
    blockerRef.current?.reset();
  };

  /** Durably disable blocking so the next navigation passes through. */
  const disable = () => {
    disableAll();
  };

  return { proceed, reset, disable };
}
