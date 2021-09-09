/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildTransform } from '..';

export const convertPeriodToWeek = () =>
  buildTransform([
    {
      transform: 'select',
      "'period'": "convertToPeriod($row.period, 'WEEK')",
      '...': '*',
    },
  ]);

export const convertEventDateToWeek = () =>
  buildTransform([
    {
      transform: 'select',
      "'period'": "convertToPeriod($row.eventDate, 'WEEK')",
      '...': '*',
    },
  ]);

