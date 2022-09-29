/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { KoBoApi } from '@tupaia/kobo-api';
import {
  DataBrokerModelRegistry,
  DataSource,
  DataSourceType,
  Event,
  SyncGroupResults,
} from '../../types';
import { Service } from '../Service';
import type { PullOptions as BasePullOptions } from '../Service';
import { KoBoTranslator } from './KoBoTranslator';
import { KoboSubmission, DataServiceSyncGroup } from './types';

type PullOptions = BasePullOptions &
  Partial<{
    startSubmissionTime: string;
  }>;

type Puller = (
  dataSources: DataServiceSyncGroup[],
  options: PullOptions,
) => Promise<Record<string, Event[]>>;

export class KoBoService extends Service {
  private readonly api: KoBoApi;
  private readonly translator: KoBoTranslator;
  private readonly pullers: Record<DataSourceType, Puller>;

  public constructor(models: DataBrokerModelRegistry, api: KoBoApi) {
    super(models);

    this.api = api;
    this.translator = new KoBoTranslator(this.models);
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics,
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents,
      [this.dataSourceTypes.SYNC_GROUP]: this.pullSyncGroups,
    };
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in KoBoService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in KoBoService');
  }

  public async pull(
    dataSources: DataServiceSyncGroup[],
    type: DataSourceType,
    options: PullOptions,
  ): Promise<SyncGroupResults>;
  public async pull(dataSources: DataSource[], type: DataSourceType, options: PullOptions) {
    const puller = this.pullers[type];
    return puller(dataSources as any, options);
  }

  private pullAnalytics = (): Promise<never> => {
    throw new Error('pullAnalytics is not supported in KoBoService');
  };

  private pullEvents = (): Promise<never> => {
    throw new Error('pullEvents is not supported in KoBoService');
  };

  private pullSyncGroups = async (
    dataSources: DataServiceSyncGroup[],
    options: PullOptions,
  ): Promise<SyncGroupResults> => {
    const resultsByDataGroupCode: Record<string, Event[]> = {};

    for (const source of dataSources) {
      const { koboSurveyCode, questionMapping, entityQuestionCode } = source.config;
      if (!koboSurveyCode) {
        throw new Error(`Missing 'koboSurveyCode' in sync group config`);
      }

      if (!entityQuestionCode) {
        throw new Error(`Missing 'entityQuestionCode' in sync group config`);
      }

      if (!questionMapping) {
        throw new Error(`Missing 'questionMapping' in sync group config`);
      }

      const results = await this.api.fetchKoBoSubmissions(koboSurveyCode, options);

      resultsByDataGroupCode[source.data_group_code] = await this.translator.translateKoBoResults(
        results,
        questionMapping,
        entityQuestionCode,
      );
    }

    return resultsByDataGroupCode;
  };

  public async pullMetadata(): Promise<never> {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
