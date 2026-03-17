import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

interface SaveDraftContextValue {
  saveAsDraft: (() => Promise<void>) | null;
  isLoading: boolean;
  register: (saveAsDraft: () => Promise<void>) => void;
  unregister: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const SaveDraftContext = createContext<SaveDraftContextValue>({
  saveAsDraft: null,
  isLoading: false,
  register: () => {},
  unregister: () => {},
  setIsLoading: () => {},
});

export const SaveDraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [saveAsDraft, setSaveAsDraft] = useState<(() => Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback((fn: () => Promise<void>) => {
    // Wrap in arrow to avoid React treating the function as a state updater
    setSaveAsDraft(() => fn);
  }, []);

  const unregister = useCallback(() => {
    setSaveAsDraft(null);
  }, []);

  return (
    <SaveDraftContext.Provider
      value={{ saveAsDraft, isLoading, register, unregister, setIsLoading }}
    >
      {children}
    </SaveDraftContext.Provider>
  );
};

export const useSaveDraftContext = () => {
  const { saveAsDraft, isLoading } = useContext(SaveDraftContext);
  return { saveAsDraft, isLoading };
};

export const useSaveDraftRegistration = () => {
  const { register, unregister, setIsLoading } = useContext(SaveDraftContext);
  return { register, unregister, setIsLoading };
};
