/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  Flight,
  getPassengersPerAgeRange,
  getTotalNumPassengers,
} from '../../../../../../apiV1/dataBuilders/modules/covid-samoa/flight';

describe('flightAgeRanges', () => {
  it('can count passengers per age range', () => {
    const flight = new Flight();

    flight.events = [
      {
        dataValues: { QMIA008: 3 },
      },
      {
        dataValues: { QMIA008: 4 },
      },
      {
        dataValues: { QMIA008: 44 },
      },
    ];

    expect(getTotalNumPassengers(flight)).to.equal(3);

    const passengersPerAgeRange = getPassengersPerAgeRange(flight);

    expect(passengersPerAgeRange['0_4'].numPassengersInThisAgeRange).to.equal(2);
    expect(passengersPerAgeRange['40_44'].numPassengersInThisAgeRange).to.equal(1);
  });

  it('skips events that do not have an age, or are outside of the age brackets', () => {
    const flight = new Flight();

    flight.events = [
      {
        dataValues: { QMIA008: 3 },
      },
      {
        dataValues: { QMIA008: 444 },
      },
      {
        dataValues: { someOtherValue: 5 },
      },
    ];

    expect(getTotalNumPassengers(flight)).to.equal(3);

    const passengersPerAgeRange = getPassengersPerAgeRange(flight);

    expect(passengersPerAgeRange['0_4'].numPassengersInThisAgeRange).to.equal(1);
  });
});
