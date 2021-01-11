/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { Flight } from '../../../../../../apiV1/dataBuilders/modules/covid-samoa/flight';

describe('Flight', () => {
  describe('fromEvents()', () => {
    it('works', () => {
      const flights = Flight.fromEvents([
        {
          dataValues: { QMIA028: '2020-10-30T22:46:00+14:00' },
        },
        {
          dataValues: { QMIA028: '2020-10-30T22:47:00+14:00' },
        },
        {
          dataValues: { QMIA028: '2020-11-05T22:46:00+14:00' },
        },
      ]);

      expect(flights.length).to.equal(2);

      expect(flights[0].key).to.equal('2020-10-30');
      expect(flights[0].date).to.equal('2020-10-30');
      expect(flights[0].events.length).to.equal(2);

      expect(flights[1].key).to.equal('2020-11-05');
      expect(flights[1].date).to.equal('2020-11-05');
      expect(flights[1].events.length).to.equal(1);
    });

    it('skips events that do not have a flight date', () => {
      const flights = Flight.fromEvents([
        {
          dataValues: { QMIA028: '2020-10-30T22:46:00+14:00' },
        },
        {
          dataValues: { someOtherValue: 45 },
        },
      ]);

      expect(flights.length).to.equal(1);

      expect(flights[0].events.length).to.equal(1);
      expect(flights[0].events[0].dataValues.QMIA028).to.equal('2020-10-30T22:46:00+14:00');
    });
  });
});
