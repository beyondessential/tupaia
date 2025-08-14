import { getOffsetForTimezone } from '../timezone';

describe('getOffsetForTimezone', () => {
  it('Should return the correct offset for the timezone', async () => {
    const date = new Date('2024-08-01');
    expect(getOffsetForTimezone('Pacific/Auckland', date)).toBe('+12:00');
    expect(getOffsetForTimezone('Pacific/Chatham', date)).toBe('+12:45');
    expect(getOffsetForTimezone('Pacific/Fiji', date)).toBe('+12:00');
    expect(getOffsetForTimezone('Asia/Kolkata', date)).toBe('+05:30');
    expect(getOffsetForTimezone('Asia/Kathmandu', date)).toBe('+05:45');
    expect(getOffsetForTimezone('Asia/Tehran', date)).toBe('+03:30');
    expect(getOffsetForTimezone('Europe/London', date)).toBe('+01:00');
    expect(getOffsetForTimezone('America/New_York', date)).toBe('-04:00');
    expect(getOffsetForTimezone('America/Los_Angeles', date)).toBe('-07:00');
    expect(getOffsetForTimezone('Pacific/Honolulu', date)).toBe('-10:00');
    expect(getOffsetForTimezone('Australia/Lord_Howe', new Date('2021-03-08'))).toBe('+11:00');
    expect(getOffsetForTimezone('Australia/Lord_Howe', new Date('2021-07-08'))).toBe('+10:30');
  });
});
