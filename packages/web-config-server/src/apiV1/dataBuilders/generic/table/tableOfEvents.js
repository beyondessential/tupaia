/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import pick from 'lodash.pick';

import { getSortByKey, utcMoment, reduceToDictionary, stripFromStart } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { transformObject } from '/apiV1/dataBuilders/transform';
import {
  addMetadataToEvents,
  isMetadataKey,
  metadataKeysToDataElementMap,
} from '/apiV1/dataBuilders/helpers';
import { getDataElementsFromCodes } from '/apiV1/utils';

const DATE_FORMAT = 'DD-MM-YYYY';
const TOTAL_KEY = 'Total';

class TableOfEventsBuilder extends DataBuilder {
  /**
   * @type {Object<string, {id, name, options: (Object|undefined)}>}
   */
  dataSources = null;

  async build() {
    this.dataSources = await this.fetchDataSources();

    return {
      rows: await this.buildRows(),
      columns: this.buildColumns(),
    };
  }

  /**
   * @returns {Promise<{ metadata: Array, dataElement: Array }>}
   */
  async fetchDataSources() {
    const { dataElement: dataElementKeys, metadata: metadataKeys } = this.getKeysBySourceType();
    const dataElements = await getDataElementsFromCodes(this.dhisApi, dataElementKeys, true);
    const metadata = metadataKeysToDataElementMap(metadataKeys);

    return { ...dataElements, ...metadata };
  }

  getKeysBySourceType() {
    const allKeys = Object.entries(this.config.columns).reduce(
      (keys, [primaryKey, { additionalData = [] }]) => keys.concat([primaryKey, ...additionalData]),
      [],
    );

    return groupBy(allKeys, key => (isMetadataKey(key) ? 'metadata' : 'dataElement'));
  }

  async fetchEvents() {
    const { organisationUnitCode, trackedEntityInstance } = this.query;
    const events = await this.getEvents({
      organisationUnitCode: trackedEntityInstance ? null : organisationUnitCode,
      dataElementIdScheme: 'code',
      dataValueFormat: 'object',
    });

    const { metadata } = this.getKeysBySourceType();
    return addMetadataToEvents(events, metadata);
  }

  async buildRows() {
    const eventsWithMetadata = await this.fetchEvents();

    const buildRow = async event => {
      const baseRow = this.buildBaseRow(event);
      const rowValues = await this.buildRowValues(event);
      return { ...baseRow, ...rowValues };
    };
    const rows = await Promise.all(eventsWithMetadata.map(buildRow));

    const totals = this.calculateTotals(rows);
    if (Object.keys(totals).length > 0) {
      rows.push({ dataElement: TOTAL_KEY, ...totals });
    }

    return rows;
  }

  buildBaseRow = event => {
    const {
      event: eventId,
      eventDate,
      orgUnitName: organisationUnitName,
      trackedEntityInstance,
    } = event;

    return {
      dataElement: utcMoment(eventDate).format(DATE_FORMAT),
      eventId,
      organisationUnitName,
      trackedEntityInstance,
    };
  };

  buildRowValues = async event => {
    const rowValues = {};
    const processColumn = async ([key, { additionalData = [], shouldNumberLines }]) => {
      const cellValues = await this.buildCellValues(event, key, additionalData);
      rowValues[key] = this.valuesToString(cellValues, shouldNumberLines);
    };
    await Promise.all(Object.entries(this.config.columns).map(processColumn));

    return rowValues;
  };

  buildCellValues = async (event, primaryKey, additionalKeys) => {
    const keys = [primaryKey].concat(additionalKeys);
    const values = pick(reduceToDictionary(event.dataValues, 'dataElement', 'value'), keys);
    const { transformation } = this.config.columns[primaryKey];

    return transformation ? transformObject(transformation, values) : values;
  };

  valuesToString(values, shouldNumberLines) {
    const formattedValues = this.getFormattedValues(values);
    const shouldAddNumbers = shouldNumberLines && formattedValues.length > 1;
    const finalValues = shouldAddNumbers ? this.addLineNumbers(formattedValues) : formattedValues;

    return finalValues.join('\n');
  }

  getFormattedValues(values) {
    return Object.entries(values).reduce((formattedValues, [key, value]) => {
      if (value === undefined) {
        return formattedValues;
      }

      const { options } = this.dataSources[key];
      return [...formattedValues, options ? options[value] : value];
    }, []);
  }

  addLineNumbers = values => values.map((value, index) => `${index + 1}. ${value}`);

  calculateTotals = rows => {
    const totals = {};
    Object.entries(this.config.columns).forEach(([key, { shouldShowTotal }]) => {
      if (shouldShowTotal) {
        totals[key] = rows.reduce((total, row) => total + parseFloat(row[key]), 0);
      }
    });

    return totals;
  };

  buildColumns() {
    const getDefaultTitle = key =>
      stripFromStart(this.dataSources[key].name, this.config.stripFromColumnNames);

    return this.getSortedColumnConfig().map(({ key, title }) => ({
      key,
      title: title || getDefaultTitle(key),
    }));
  }

  /**
   * Sort columns by their `sortOrder`, uses column key if undefined
   * Columns that have `sortOrder` defined will appear before the ones that do not
   *
   * @returns {Array<{ sortOrder, key }>}
   */
  getSortedColumnConfig() {
    const columnConfig = Object.entries(this.config.columns).map(([key, value]) => ({
      ...value,
      // Cast `sortOrder` to string to correctly compare it with other string values
      // Numeric characters take precedence over alphabetic ones, which is desired here
      sortOrder: value.sortOrder ? `${value.sortOrder}` : key,
      key,
    }));

    return Object.values(columnConfig).sort(getSortByKey('sortOrder'));
  }
}

export const tableOfEvents = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfEventsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
