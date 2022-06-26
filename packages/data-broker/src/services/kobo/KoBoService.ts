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
import { KoBoTranslator } from './KoBoTranslator';
import { KoboSubmission, SyncGroup } from './types';

type PullSyncGroupsOptions = Partial<{
  startSubmissionTime: string;
}>;

type Puller = (
  dataSources: SyncGroup[],
  options: PullSyncGroupsOptions,
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
    dataSources: SyncGroup[],
    type: DataSourceType,
    options: PullSyncGroupsOptions,
  ): Promise<SyncGroupResults>;
  public async pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options: Record<string, unknown>,
  ) {
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
    dataSources: SyncGroup[],
    options: PullSyncGroupsOptions,
  ): Promise<SyncGroupResults> => {
    const resultsByInternalCode: Record<string, Event[]> = {};
    for (const source of dataSources) {
      const results: KoboSubmission[] = await this.api.fetchKoBoSubmissions(
        source.config?.koboSurveyCode,
        options,
      );
      resultsByInternalCode[
        source.config?.internalSurveyCode
      ] = await this.translator.translateKoBoResults(
        results,
        source.config?.questionMapping,
        source.config?.entityQuestionCode,
      );
    }

    return resultsByInternalCode;
  };

  public async pullMetadata(): Promise<never> {
    throw new Error('pullMetadata is not supported in KoBoService');
  }
}
