import { flatten } from 'es-toolkit/compat';

import { dateStringToPeriod } from '@tupaia/utils';
import { buildEventsFromDhisEventAnalytics } from './buildEventsFromDhisEventAnalytics';
import { RawAnalyticResults, DataBrokerModelRegistry, Event } from '../../../types';
import { DhisEventAnalytics } from '../types';

export const buildAnalyticsFromDhisEventAnalytics = async (
  models: DataBrokerModelRegistry,
  dhisEventAnalytics: DhisEventAnalytics,
  dataElementCodes: string[] = [],
): Promise<RawAnalyticResults> => {
  const events = await buildEventsFromDhisEventAnalytics(
    models,
    dhisEventAnalytics,
    dataElementCodes,
  );

  return {
    results: eventsToAnalytics(events),
    metadata: buildMetadata(dhisEventAnalytics, dataElementCodes),
  };
};

const eventsToAnalytics = (events: Event[]) =>
  flatten(
    events.map(({ eventDate, orgUnit, dataValues }) =>
      Object.entries(dataValues).map(([dataElement, value]) => ({
        period: dateStringToPeriod(eventDate),
        organisationUnit: orgUnit,
        dataElement,
        value,
      })),
    ),
  );

const buildMetadata = (dhisEventAnalytics: DhisEventAnalytics, dataElementCodes: string[]) => {
  const { items: dimensionCodeToName } = dhisEventAnalytics.metaData;

  const dataElementCodeToName: Record<string, string> = {};
  Object.entries(dimensionCodeToName).forEach(([code, { name }]) => {
    if (dataElementCodes.includes(code)) {
      dataElementCodeToName[code] = name;
    }
  });

  return { dataElementCodeToName };
};
