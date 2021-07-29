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
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics,
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents,
      [this.dataSourceTypes.SYNC_GROUP]: this.pullSyncGroup,
    };
  }

  async push() {
    throw new Error('Data push is not supported in KoBoService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in KoBoService');
  }

  async pull(dataSources, type, options) {
    const puller = this.pullers[type];
    return puller(dataSources, options);
  }

  pullAnalytics = () => {
    throw new Error('pullAnalytics is not supported in KoBoService');
  };

  pullEvents = () => {
    throw new Error('pullEvents is not supported in KoBoService');
  };

  pullSyncGroup = async (dataSources, options) => {
    const koboSurveyCodes = dataSources.map(({ config }) => config.koboSurveyCode);
    const koboEntityQuestion = dataSources.map(({ config }) => config.entityQuestionCode);
    const questionCodeMapping = dataSources.map(({ config }) => config.questionCodeMapping);

    const koboResults = await this.api.fetchKoBoSurveys(koboSurveyCodes, options);
    return this.translator.translateKoBoResults(
      koboResults,
      questionCodeMapping[0],
      koboEntityQuestion[0],
    );
  };

  async pullMetadata() {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
