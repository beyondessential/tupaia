import React, { createContext, useCallback, useContext, useRef } from 'react';

type DisableFn = () => void;

interface NavigationBlockerContextType {
  /** Register a blocker's disable function. Returns an unregister callback. */
  register: (disable: DisableFn) => () => void;
  /** Disable all registered navigation blockers. */
  disableAll: () => void;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType>({
  register: () => () => {},
  disableAll: () => {},
});

export const NavigationBlockerProvider = ({ children }: { children: React.ReactNode }) => {
  const disableFnsRef = useRef(new Set<DisableFn>());

  const register = useCallback((disable: DisableFn) => {
    disableFnsRef.current.add(disable);
    return () => {
      disableFnsRef.current.delete(disable);
    };
  }, []);

  const disableAll = useCallback(() => {
    disableFnsRef.current.forEach(fn => fn());
  }, []);

  const value = React.useMemo(() => ({ register, disableAll }), [register, disableAll]);

  return (
    <NavigationBlockerContext.Provider value={value}>{children}</NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlockerContext = () => useContext(NavigationBlockerContext);
