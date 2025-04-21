import keyBy from 'lodash.keyby';

import { DhisApi, translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';
import { mapKeys, reduceToDictionary } from '@tupaia/utils';
import { InboundAnalyticsTranslator } from './InboundAnalyticsTranslator';
import { parseValueForDhis } from './parseValueForDhis';
import { DATA_SOURCE_TYPES } from '../../../utils';
import { DataElement, DataSource, DhisAnalytics, DhisEventAnalytics, ValueType } from '../types';
import {
  DataBrokerModelRegistry,
  DataElementMetadata,
  DhisMetadataObject,
  Event,
  OutboundEvent,
} from '../../../types';
import { formatInboundDataElementName } from './formatDataElementName';

interface OutboundDataValue {
  code: string;
  value?: string;
  categoryOptionCombo?: string;
}

interface DhisDataValue {
  dataElement: string;
  value?: string;
  period?: string;
  orgUnit?: string;
  categoryOptionCombo?: string;
}

export interface DataElementDescriptor {
  id: string;
  code: string;
  valueType: ValueType;
  options?: Record<string, string>;
}

export class DhisTranslator {
  private readonly models: DataBrokerModelRegistry;
  private readonly inboundAnalyticsTranslator: InboundAnalyticsTranslator;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
    this.inboundAnalyticsTranslator = new InboundAnalyticsTranslator();
  }

  // @ts-ignore
  private get dataSourceTypes() {
    return DATA_SOURCE_TYPES;
  }

  public getOutboundValue = (dataElement: DataElementDescriptor, value?: string) => {
    if (value === undefined) return value; // "delete" pushes don't include a value
    const { options, code: dataElementCode, valueType } = dataElement;
    if (options) {
      const optionCode = options[value.toLowerCase()]; // Convert text to lower case so we can ignore case
      if (!optionCode) {
        throw new Error(`No option matching ${value} for data element ${dataElementCode}`);
      }
      return optionCode;
    }
    // not using an option set, parse the value according to the data element type
    try {
      return parseValueForDhis(value, valueType);
    } catch (error) {
      throw new Error(`Could not parse ${dataElementCode}: ${(error as Error).message}`);
    }
  };

  private fetchOutboundDataElementsByCode = async (
    api: DhisApi,
    dataSources: DataElement[],
  ): Promise<Record<string, DataElementDescriptor>> => {
    const dataElementCodes = [...new Set(dataSources.map(d => d.dataElementCode))];
    const dataElements: DataElementDescriptor[] = await api.fetchDataElements(dataElementCodes, {
      includeOptions: true,
      additionalFields: ['valueType'],
    });
    const codesFound = dataElements.map(de => de.code);
    const codesNotFound = dataElementCodes.filter(c => !codesFound.includes(c));
    if (codesNotFound.length > 0) {
      throw new Error(
        `The following data elements were not found on DHIS2 during push: ${codesNotFound}`,
      );
    }
    // invert options from { code: name } to { name: code }, and transform the name to lower case,
    // because that's the way they're used during outbound translation
    const dataElementsWithTranslatedOptions = dataElements.map(
      ({ options, ...restOfDataElement }) => ({
        options:
          options &&
          Object.entries(options).reduce<Record<string, string>>(
            (translatedOptions, [code, name]) => {
              translatedOptions[name.toLowerCase()] = code;
              return translatedOptions;
            },
            {},
          ),
        ...restOfDataElement,
      }),
    );
    return keyBy(dataElementsWithTranslatedOptions, 'code');
  };

  private translateOutboundDataValue = (
    { code, value, ...restOfDataValue }: OutboundDataValue,
    dataSource: DataElement,
    dataElement: DataElementDescriptor,
  ) => {
    const valueToPush = this.getOutboundValue(dataElement, value);

    const outboundDataValue: DhisDataValue = {
      dataElement: dataElement.code,
      value: valueToPush,
      ...restOfDataValue,
    };

    // add category option combo code if defined
    const { categoryOptionCombo } = dataSource.config;
    if (categoryOptionCombo) {
      outboundDataValue.categoryOptionCombo = categoryOptionCombo;
    }

    return outboundDataValue;
  };

  public translateOutboundDataValues = async <T extends OutboundDataValue>(
    api: DhisApi,
    dataValues: T[],
    dataSources: DataElement[],
  ) => {
    // prefetch options and types for unique data element codes so that DHIS2 doesn't get overwhelmed
    const dataSourcesByCode = keyBy(dataSources, 'code');
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    return dataValues.map(dataValue => {
      const dataSource = dataSourcesByCode[dataValue.code];
      const dataElement = dataElementsByCode[dataSource.dataElementCode];
      return this.translateOutboundDataValue(dataValue, dataSource, dataElement) as Exclude<
        T & { dataElement: string },
        'code'
      >;
    });
  };

  public async translateOutboundEventDataValues(
    api: DhisApi,
    dataValues: OutboundEvent['dataValues'],
  ) {
    const dataSources = await this.models.dataElement.find({
      code: dataValues.map(({ code }) => code),
    });
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    const outboundDataValues = await this.translateOutboundDataValues(api, dataValues, dataSources);
    const dataValuesWithIds = outboundDataValues.map(({ dataElement: dataElementCode, value }) => {
      const dataElement = dataElementsByCode[dataElementCode];
      if (!dataElement) {
        throw new Error(`Missing id for data element ${dataElementCode} in event push`);
      }
      return {
        dataElement: dataElement.id,
        value,
      };
    });
    return dataValuesWithIds;
  }

  public async translateOutboundEvent(api: DhisApi, { dataValues, ...restOfEvent }: OutboundEvent) {
    const translatedDataValues = await this.translateOutboundEventDataValues(api, dataValues);
    return { ...restOfEvent, dataValues: translatedDataValues };
  }

  public translateInboundAnalytics = (response: DhisAnalytics, dataSources: DataElement[]) => {
    return this.inboundAnalyticsTranslator.translate(response, dataSources);
  };

  public async translateInboundEvents(events: Event[], dataGroupCode: string): Promise<Event[]> {
    const dataElementsInGroup =
      await this.models.dataGroup.getDataElementsInDataGroup(dataGroupCode);
    const dataElementToSourceCode = reduceToDictionary(
      dataElementsInGroup,
      'dataElementCode',
      'code',
    );

    return events.map(({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: mapKeys(dataValues, dataElementToSourceCode, { defaultToExistingKeys: true }),
    }));
  }

  public translateInboundEventAnalytics = async (
    eventAnalytics: DhisEventAnalytics,
    dataElementSources: DataElement[],
  ): Promise<DhisEventAnalytics> => {
    const dataElementToSourceCode = reduceToDictionary(
      dataElementSources,
      'dataElementCode',
      'code',
    );
    return translateElementKeysInEventAnalytics(eventAnalytics, dataElementToSourceCode);
  };

  // Override metadata code by data element code
  public translateInboundDataElements = (
    metadata: DhisMetadataObject[],
    categoryOptionCombos: DhisMetadataObject[],
    dataElements: DataElement[],
  ) => {
    const metadataGroupedByCode = Object.fromEntries(
      metadata.map(dataElement => [dataElement.code, dataElement]),
    );

    let results: DhisMetadataObject[] = [];

    metadata.forEach(mData => {
      const translatedMetadata = dataElements
        .filter(dataSource => dataSource.dataElementCode === mData.code)
        .map(({ code, dataElementCode, config }) => {
          const { id, name, options } = metadataGroupedByCode[dataElementCode];
          const { categoryOptionCombo: categoryOptionComboCode } = config;
          const categoryOptionCombo = categoryOptionCombos.find(
            item => item.code === categoryOptionComboCode,
          );
          const dataElementName = formatInboundDataElementName(name, categoryOptionCombo?.name);
          const metadataResults: DhisMetadataObject = {
            id,
            name: dataElementName,
            code,
          };

          if (options) {
            metadataResults.options = options;
          }

          return metadataResults;
        });

      if (translatedMetadata.length > 0) {
        results = results.concat(translatedMetadata);
      } else {
        results.push(mData);
      }
    });

    return results;
  };

  public translateInboundIndicators = (
    indicators: DhisMetadataObject[],
    dataSources: DataElement[],
  ) => {
    const indicatorIdToSourceCode = reduceToDictionary(
      dataSources,
      (d: DataSource) => d.config?.dhisId as string,
      'code',
    );

    return indicators.map(({ code, ...restOfIndicators }) => {
      const translatedIndicators: Partial<DhisMetadataObject> = { ...restOfIndicators };
      const { id } = translatedIndicators;
      if (!translatedIndicators.code && id) {
        translatedIndicators.code = indicatorIdToSourceCode[id];
      }
      return translatedIndicators as DataElementMetadata;
    });
  };
}
