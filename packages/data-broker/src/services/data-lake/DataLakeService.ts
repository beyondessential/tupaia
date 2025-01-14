import type { DataLakeApi } from '@tupaia/data-lake-api';
import { DataBrokerModelRegistry, DataElement, DataGroup } from '../../types';
import { DataServiceMapping } from '../DataServiceMapping';
import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

type PullAnalyticsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
  dataElementCodes?: string[];
  dataGroupCode?: string;
  eventId?: string;
};

type PullEventsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
  dataElementCodes?: string[];
};

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class DataLakeService extends Service {
  private readonly api: DataLakeApi;

  public constructor(models: DataBrokerModelRegistry, api: DataLakeApi) {
    super(models);

    this.api = api;
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in DataLakeService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in DataLakeService');
  }

  public async pullAnalytics(dataElements: DataElement[], options: PullAnalyticsOptions) {
    const dataElementCodes = dataElements.map(({ code }) => code);
    const { analytics, numAggregationsProcessed } = await this.api.fetchAnalytics({
      ...translateOptionsForApi(options),
      dataElementCodes,
    });

    return {
      results: analytics,
      metadata: {},
      numAggregationsProcessed,
    };
  }

  public async pullEvents(dataGroups: DataGroup[], options: PullEventsOptions) {
    if (dataGroups.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataGroup] = dataGroups;
    const { code: dataGroupCode } = dataGroup;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }

  public async pullSyncGroupResults(): Promise<never> {
    throw new Error('pullSyncGroupResults is not supported in DataLakeService');
  }
}
