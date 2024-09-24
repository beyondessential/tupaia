/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

type WindowWithGa = Window & {
  ga: (...args: any[]) => void;
};

const ga = (window as unknown as WindowWithGa).ga || (() => {});

export const gaEvent = (category: string, action: string, label?: string) =>
  ga('send', 'event', category, action, label);

export default ga;
