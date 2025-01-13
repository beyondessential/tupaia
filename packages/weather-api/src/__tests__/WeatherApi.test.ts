import { WeatherApi } from '../WeatherApi';

describe('WeatherApi', () => {
  it('Can create a new instance', async () => {
    expect(new WeatherApi()).toBeDefined();
  });
});
