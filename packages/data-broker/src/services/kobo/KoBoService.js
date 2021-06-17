/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';

export class KoBoService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
  }

  async push() {
    throw new Error('Data push is not supported in KoBoService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in KoBoService');
  }

  async pull(dataSources, type, options) {
    if (type === this.dataSourceTypes.DATA_ELEMENT) {
      throw new Error('Analytic pulling is not supported in KoBoService');
    }
    return this.pullEvents(dataSources, options);
  }

  async pullEvents(dataSources, options) {
    const koboSurveyCodes = dataSources.map(({ config }) => config.koboSurveyCode);

    // TODO: Throw error on entity filter

    return {
      results: await this.api.fetchKoBoSurveys(koboSurveyCodes, options),
      metadata: { dataElementCodeToName: {} },
    };
  }

  async pullMetadata() {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
