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
      [this.dataSourceTypes.SYNC_GROUP]: this.pullSyncGroups,
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

  pullSyncGroups = async (dataSources, options) => {
    const resultsByDataGroupCode = {};

    for (const source of dataSources) {
      const results = await this.api.fetchKoBoSubmissions(source.config?.koboSurveyCode, options);

      resultsByDataGroupCode[source.data_group_code] = await this.translator.translateKoBoResults(
        results,
        source.config?.questionMapping,
        source.config?.entityQuestionCode,
      );
    }

    return resultsByDataGroupCode;
  };

  async pullMetadata() {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
