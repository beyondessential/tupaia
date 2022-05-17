/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { EventsPuller } from './EventsPuller';

type Options = Partial<{
  organisationUnitCodes: string[];
  orgUnitIdScheme: 'uid' | 'code';
  startDate: string;
  endDate: string;
  eventId: string;
  trackedEntityInstance: string;
}>;

/**
 * This is a deprecated puller which invokes a slow DHIS2 api ('/events')
 * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
 * It is invoked using the `options.useDeprecatedApi` flag
 *
 * TODO Delete this puller as soon as all its past consumers have migrated over to
 * the new (non-deprecated) method
 */
export class DeprecatedEventsPuller extends EventsPuller {
  protected pullEventsForApi = async (api: DhisApi, programCode: string, options: Options) => {
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
}
