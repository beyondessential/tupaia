import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { isWebApp } from '../utils/displayMode';

/**
 * The `beforeinstallprompt` event is a non-standard Chromium event not included in the DOM lib.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallPromptContextValue {
  /** Whether the app is already installed as a PWA */
  isAppInstalled: boolean;
  /** Whether the browser supports the install prompt (Chromium only) */
  canPromptInstall: boolean;
  /** Trigger the browser's native PWA install dialog. Returns the user's choice. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | null>;
}

const PwaInstallPromptContext = createContext<PwaInstallPromptContextValue>({
  isAppInstalled: false,
  canPromptInstall: false,
  promptInstall: async () => null,
});

export const PwaInstallPromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(isWebApp);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;

    const result = await deferredPrompt.prompt();
    setDeferredPrompt(null);
    return result.outcome;
  }, [deferredPrompt]);

  return (
    <PwaInstallPromptContext.Provider
      value={{
        isAppInstalled,
        canPromptInstall: !!deferredPrompt,
        promptInstall,
      }}
    >
      {children}
    </PwaInstallPromptContext.Provider>
  );
};

export const usePwaInstallPrompt = () => useContext(PwaInstallPromptContext);
