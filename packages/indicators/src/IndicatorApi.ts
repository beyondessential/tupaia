/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { utcMoment } from '@tupaia/utils';

interface TupaiaDatabase {}
interface DataBroker {}

const ANALYTICS_DATE_FORMAT = 'YYYY-MM-DD';

export class IndicatorApi {
  database: TupaiaDatabase;
  aggregator: Aggregator;

  constructor(database: TupaiaDatabase, dataBroker: DataBroker) {
    this.database = database;
    this.aggregator = new Aggregator(dataBroker);
  }

  async fetchAnalytics(options) {
    const { dataElementCodes, ...restOfOptions } = options;
    // TODO implement indicator builder pattern
    return dataElementCodes.map(code => ({
      dataElement: code,
      organisationUnit: 'TO',
      date: utcMoment().format(ANALYTICS_DATE_FORMAT),
      value: 15,
    }));
  }

  async fetchEvents() {
    throw new Error('Event based indicators are not currently supported');
  }

  async fetchDataElements(dataElementCodes) {
    // TODO fetch an array of { code, name } objects from the indicators table
    return dataElementCodes.map(code => ({ code, name: code }));
  }
}
