/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useEffect } from 'react';
import { gaEvent } from '.';

export const useGAEffect = (eventCategory: string, eventAction: string, watchValue?: string) => {
  useEffect(() => {
    if (watchValue === undefined || watchValue === null) return;
    console.log(eventCategory, eventAction, watchValue);
    gaEvent(eventCategory, eventAction, watchValue);
  }, [watchValue, eventCategory, eventAction]);
};
