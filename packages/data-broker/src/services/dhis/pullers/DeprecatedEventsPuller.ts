import type { DhisApi } from '@tupaia/dhis-api';
import { DataGroup } from '../types';
import { DataBrokerModelRegistry, Event } from '../../../types';
import { DataServiceMapping } from '../../DataServiceMapping';
import { DhisTranslator } from '../translators';

export type DeprecatedPullEventsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  orgUnitIdScheme?: 'uid' | 'code';
  startDate?: string;
  endDate?: string;
  eventId?: string;
  trackedEntityInstance?: string;
};

/**
 * @deprecated
 * This is a deprecated puller which invokes a slow DHIS2 api ('/events')
 * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
 * It is invoked using the `options.useDeprecatedApi` flag
 *
 * @privateRemarks
 * TODO Delete this puller as soon as all its past consumers have migrated over to
 * the new (non-deprecated) method
 */
export class DeprecatedEventsPuller {
  // @ts-ignore
  private readonly models: DataBrokerModelRegistry;
  private readonly translator: DhisTranslator;

  public constructor(models: DataBrokerModelRegistry, translator: DhisTranslator) {
    this.models = models;
    this.translator = translator;
  }

  private pullEventsForApi = async (
    api: DhisApi,
    programCode: string,
    options: DeprecatedPullEventsOptions,
  ) => {
    const {
      organisationUnitCodes = [],
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    } = options;

    const events = await api.getEvents({
      programCode,
      dataElementIdScheme: 'code',
      organisationUnitCode: organisationUnitCodes[0],
      dataValueFormat: 'object',
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    } as Parameters<DhisApi['getEvents']>[0]);

    return this.translator.translateInboundEvents(events, programCode);
  };

  public pull = async (
    apis: DhisApi[],
    dataGroups: DataGroup[],
    options: DeprecatedPullEventsOptions,
  ) => {
    if (dataGroups.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataGroup] = dataGroups;
    const { code: programCode } = dataGroup;

    const events: Event[] = [];
    const pullForApi = async (api: DhisApi) => {
      const newEvents = await this.pullEventsForApi(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
