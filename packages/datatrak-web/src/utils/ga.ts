/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

type WindowWithGa = Window & {
  gtag: (...args: any[]) => void;
};

const gtag = (window as unknown as WindowWithGa).gtag || (() => {});

if (!(window as unknown as WindowWithGa).gtag && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('Google Analytics library not found');
}

export const gaEvent = (action: string, category: string, label?: string) =>
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
