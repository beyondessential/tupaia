/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { KoBoTranslator } from './KoBoTranslator';

export class KoBoService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
    this.translator = new KoBoTranslator(this.models);
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
    const koboEntityQuestion = dataSources.map(({ config }) => config.entityQuestionCode);

    // TODO: Throw error on entity filter
    const koboResults = await this.api.fetchKoBoSurveys(koboSurveyCodes, options);
    return this.translator.translateKoBoResults(koboResults, koboEntityQuestion[0]);
  }

  async pullMetadata() {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
