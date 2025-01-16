import type { FetchOptions as IndicatorFetchOptions, IndicatorApi } from '@tupaia/indicators';
import { DataBrokerModelRegistry, DataElement } from '../../types';
import { DataServiceMapping } from '../DataServiceMapping';
import { Service } from '../Service';

type PullOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
} & IndicatorFetchOptions;

export class IndicatorService extends Service {
  private readonly api: IndicatorApi;

  public constructor(models: DataBrokerModelRegistry, api: IndicatorApi) {
    super(models);

    this.api = api;
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in IndicatorService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in IndicatorService');
  }

  public async pullAnalytics(dataElements: DataElement[], options: PullOptions) {
    const indicatorCodes = dataElements.map(({ code }) => code);

    return {
      results: await this.api.buildAnalytics(indicatorCodes, options),
      // TODO: either implement properly in #NOT-521 or remove entirely in #NOT-522
      metadata: { dataElementCodeToName: {} },
    };
  }

  public async pullEvents(): Promise<never> {
    throw new Error('pullEvents is not supported in IndicatorService');
  }

  public async pullSyncGroupResults(): Promise<never> {
    throw new Error('pullSyncGroupResults is not supported in IndicatorService');
  }
}
