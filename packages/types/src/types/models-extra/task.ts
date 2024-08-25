/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export type RepeatSchedule = Record<string, unknown> & {
  freq?: number;
  interval?: number;
  bymonthday?: number | number[] | null;
  bysetpos?: number | number[] | null;
  dtstart?: Date | null;
};
