import { sanitizeValue } from './sanitizeValue';
import { Analytic, DataBrokerModelRegistry, Event, RequireKeys } from '../../../types';
import { DhisEventAnalytics, ValueType } from '../types';

const METADATA_DIMENSION_TRANSLATION = {
  psi: 'event',
  oucode: 'orgUnit',
  ouname: 'orgUnitName',
  eventdate: 'eventDate',
  tei: 'trackedEntityId',
};

type ColumnSpec = {
  dimension: keyof Analytic;
  valueType: ValueType;
};

type MetadataDimension = keyof typeof METADATA_DIMENSION_TRANSLATION;

type EventMetadataKey = Exclude<keyof Event, 'dataValues'>;

const createDimensionTranslator = (dataElementCodes: string[]) => (dimension: string) => {
  const metadataDimension = METADATA_DIMENSION_TRANSLATION[dimension as MetadataDimension];
  if (metadataDimension) {
    return metadataDimension;
  }

  // Unfortunately there is no 100% accurate way to tell if a dimension is a data element
  // just from the DHIS2 response, thus we must get this information via `dataElementCodes`
  return dataElementCodes.includes(dimension) ? dimension : '';
};

export const buildEventsFromDhisEventAnalytics = async (
  models: DataBrokerModelRegistry,
  dhisEventAnalytics: DhisEventAnalytics,
  dataElementCodes: string[] = [],
): Promise<Event[]> => {
  const events = buildEvents(dhisEventAnalytics, dataElementCodes);
  const eventsWithTrackedEntityCodes = await addTrackedEntityCodes(models, events);
  return eventsWithTrackedEntityCodes;
};

const buildEvents = (dhisEventAnalytics: DhisEventAnalytics, dataElementCodes: string[] = []) => {
  const { headers, rows } = dhisEventAnalytics;
  const columnSpecs = getColumnSpecs(headers, dataElementCodes);

  const events: Event[] = [];
  rows.forEach(row => {
    const event: RequireKeys<Partial<Event>, 'dataValues'> = { dataValues: {} };
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        return;
      }

      const formattedValue = sanitizeValue(value, valueType as ValueType);
      if (dataElementCodes.includes(dimension)) {
        event.dataValues[dimension] = formattedValue;
      } else {
        event[dimension as EventMetadataKey] = formattedValue as string;
      }
    });
    events.push(event as Event);
  });
  return events;
};

const getColumnSpecs = (
  headers: DhisEventAnalytics['headers'],
  dataElementCodes: string[],
): Partial<ColumnSpec>[] => {
  const columnSpecs = new Array(headers.length).fill({});
  const translateDimension = createDimensionTranslator(dataElementCodes);

  headers.forEach(({ name: dimension, valueType }, columnIndex) => {
    const translatedDimension = translateDimension(dimension);
    if (translatedDimension) {
      columnSpecs[columnIndex] = { dimension: translatedDimension, valueType };
    }
  });

  return columnSpecs;
};

const addTrackedEntityCodes = async (models: DataBrokerModelRegistry, events: Event[]) => {
  const allTrackedEntityIds = Array.from(
    new Set(events.filter(event => !!event.trackedEntityId).map(event => event.trackedEntityId)),
  );
  if (allTrackedEntityIds.length === 0) {
    return events;
  }
  const entities = await models.entity.find({
    // @ts-ignore
    'metadata->dhis->>trackedEntityId': allTrackedEntityIds,
  });
  return events.map(event => ({
    ...event,
    trackedEntityCode:
      entities.find(entity => entity.metadata?.dhis?.trackedEntityId === event.trackedEntityId)
        ?.code ?? '',
  }));
};
