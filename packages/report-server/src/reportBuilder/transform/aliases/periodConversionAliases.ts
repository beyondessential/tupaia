/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildTransform } from '..';

export const convertPeriodToWeek = () =>
  buildTransform([
    {
      transform: 'updateColumns',
      insert: {
        period: "convertToPeriod($period, 'WEEK')",
      },
      include: '*',
    },
  ]);

export const convertEventDateToWeek = () =>
  buildTransform([
    {
      transform: 'updateColumns',
      insert: {
        period: "convertToPeriod($eventDate, 'WEEK')",
      },
      include: '*',
    },
  ]);
