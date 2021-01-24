/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  Flight,
  getPassengersPerDataValue,
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

    expect(passengersPerAgeRange['0_4'].numPassengers).to.equal(2);
    expect(passengersPerAgeRange['40_44'].numPassengers).to.equal(1);
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

    expect(passengersPerAgeRange['0_4'].numPassengers).to.equal(1);
  });

  it('can count passengers per data_value', () => {
    const flight = new Flight();

    flight.events = [
      {
        dataValues: { QMIA031: 1 },
      },
      {
        dataValues: { QMIA031: 1 },
      },
      {
        dataValues: { QMIA031: 0, QMIA032: 1 },
      },
      {
        dataValues: { QMIA033: 0 },
      },
    ];

    const dataValues = [['QMIA031'], ['QMIA032'], ['QMIA033']];

    expect(getTotalNumPassengers(flight)).to.equal(4);

    const passengersPerDataValue = getPassengersPerDataValue(flight, dataValues, false);

    expect(passengersPerDataValue.QMIA031.numPassengers).to.equal(2);
    expect(passengersPerDataValue.QMIA032.numPassengers).to.equal(1);
    expect(passengersPerDataValue.QMIA033.numPassengers).to.equal(0);
  });

  it('can count passengers per data_value with specified value', () => {
    const flight = new Flight();

    flight.events = [
      {
        dataValues: { QMIA009: 'M' },
      },
      {
        dataValues: { QMIA009: 'F' },
      },
      {
        dataValues: { QMIA009: 'F', QMIA032: 1 },
      },
      {
        dataValues: { QMIA009: 'F' },
      },
    ];

    const dataValues = [
      ['QMIA009', 'F'],
      ['QMIA009', 'M'],
    ];

    expect(getTotalNumPassengers(flight)).to.equal(4);

    const passengersPerDataValue = getPassengersPerDataValue(flight, dataValues, true);

    expect(passengersPerDataValue.QMIA009_M.numPassengers).to.equal(1);
    expect(passengersPerDataValue.QMIA009_F.numPassengers).to.equal(3);
  });
});
