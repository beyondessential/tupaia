import { useEffect } from 'react';
import { gaEvent } from '.';

export const useGAEffect = (eventCategory: string, eventAction: string, watchValue?: string) => {
  useEffect(() => {
    if (watchValue === undefined || watchValue === null) return;
    gaEvent(eventCategory, eventAction, watchValue);
  }, [watchValue, eventCategory, eventAction]);
};
