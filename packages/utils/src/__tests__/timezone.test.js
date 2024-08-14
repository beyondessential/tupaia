/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { getOffsetForTimezone } from '../timezone';

describe('getOffsetForTimezone', () => {
  it('Should return the correct offset for the timezone', async () => {
    expect(getOffsetForTimezone('Pacific/Auckland')).toBe('+12:00');
    expect(getOffsetForTimezone('Pacific/Chatham')).toBe('+12:45');
    expect(getOffsetForTimezone('Pacific/Fiji')).toBe('+12:00');
    expect(getOffsetForTimezone('Asia/Kolkata')).toBe('+05:30');
    expect(getOffsetForTimezone('Asia/Kathmandu')).toBe('+05:45');
    expect(getOffsetForTimezone('Asia/Tehran')).toBe('+03:30');
    expect(getOffsetForTimezone('Europe/London')).toBe('+01:00');
    expect(getOffsetForTimezone('America/New_York')).toBe('-04:00');
    expect(getOffsetForTimezone('America/Los_Angeles')).toBe('-07:00');
    expect(getOffsetForTimezone('Pacific/Honolulu')).toBe('-10:00');
  });
});
