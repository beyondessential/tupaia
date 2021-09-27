/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EventsPuller } from './EventsPuller';

/**
 * This is a deprecated puller which invokes a slow DHIS2 api ('/events')
 * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
 * It is invoked using the `options.useDeprecatedApi` flag
 *
 * TODO Delete this puller as soon as all its past consumers have migrated over to
 * the new (non-deprecated) method
 */
export class DeprecatedEventsPuller extends EventsPuller {

  /**
   * @override
   */
  pullEventsForApi = async (api, programCode, options) => {
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
    });

    return this.translator.translateInboundEvents(events, programCode);
  };
}
