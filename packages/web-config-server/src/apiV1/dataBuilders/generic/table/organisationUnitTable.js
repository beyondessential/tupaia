/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey, reduceToSet, stripFromStart } from '@tupaia/utils';
import { getDataElementGroupSets } from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { DATA_SOURCE_TYPES } from '/apiV1/dataBuilders/dataSourceTypes';
import { buildCategories } from './buildCategories';

const { SINGLE, GROUP_SET } = DATA_SOURCE_TYPES;

/**
 * Configuration schema
 * @typedef {Object} OrganisationUnitTableConfig
 * @property {DataSource} dataSource
 * @property {string} [columnTitle]
 * @property {string} [optionSetCode]
 *
 * Example:
 * ```js
 * {
 *   "dataSource": {
 *     "type": "single",
 *     "codes": ["QTY_375874bf", "QTY_44ec84bf"],
 *     "programCode": "FRIDGE_DAILY"
 *   },
 *   "columnTitle": "Stock Count",
 *   "optionSetCode": "white.green.orange.red"
 * }
 *```
 */

class OrganisationUnitTableDataBuilder extends DataBuilder {
  /**
   * @returns {TableOutput}
   */
  async build() {
    const { type } = this.config.dataSource;
    if (![SINGLE, GROUP_SET].includes(type)) {
      throw new Error("Only 'single' and 'groupSet' data source types supported");
    }

    const {
      dataElementCodes,
      dataElementGroups,
      dataElementToGroupMapping,
    } = await this.getDataElementInfo();
    const analytics = await this.fetchAnalytics(dataElementCodes);

    const responseObject = {
      rows: await this.buildRows(analytics, dataElementToGroupMapping),
      columns: await this.buildColumns(analytics),
    };
    if (this.hasCategories()) {
      responseObject.categories = buildCategories(dataElementGroups);
    }

    return responseObject;
  }

  /**
   * @returns {{ dataElementCodes, dataElementGroups, dataElementToGroupMapping }}
   */
  async getDataElementInfo() {
    const {
      dataSource: { codes },
    } = this.config;

    if (this.hasCategories()) {
      const groupSets = await getDataElementGroupSets(this.dhisApi, codes, true);
      const { dataElementGroups, dataElementToGroupMapping } = Object.values(groupSets)[0];

      const dataElementCodes = [];
      Object.values(dataElementGroups).forEach(({ dataElements }) => {
        const newCodes = dataElements.map(({ code }) => code);
        dataElementCodes.push(...newCodes);
      });

      return { dataElementCodes, dataElementGroups, dataElementToGroupMapping };
    }

    return { dataElementCodes: codes, dataElementGroups: [], dataElementToGroupMapping: null };
  }

  hasCategories() {
    const { dataSource } = this.config;
    return dataSource.type === GROUP_SET;
  }

  async buildRows(analytics, dataElementToGroupMapping = null) {
    const { stripFromDataElementNames } = this.config;
    const { results, metadata } = analytics;
    const optionSetOptions = await this.getOptionSetOptions();

    const rows = {};
    results.forEach(({ dataElement: dataElementCode, organisationUnit, value }) => {
      if (!rows[dataElementCode]) {
        rows[dataElementCode] = {
          dataElement: stripFromStart(
            metadata.dataElementCodeToName[dataElementCode],
            stripFromDataElementNames,
          ),
        };
      }
      if (dataElementToGroupMapping) {
        rows[dataElementCode].categoryId = dataElementToGroupMapping[dataElementCode];
      }

      rows[dataElementCode][organisationUnit] = optionSetOptions ? optionSetOptions[value] : value;
    });

    return Object.values(rows).sort(getSortByKey('dataElement'));
  }

  async getOptionSetOptions() {
    const { optionSetCode } = this.config;
    return optionSetCode ? this.dhisApi.getOptionSetOptions({ code: optionSetCode }) : null;
  }

  async buildColumns(analytics) {
    const facilitiesByType = await this.entity.getFacilitiesByType();
    const fixedColumnTitle = (this.entity.isFacility() && this.config.columnTitle) || null;
    const orgUnitsWithData = reduceToSet(analytics.results, 'organisationUnit');

    const columns = [];
    const sortByType = getSortByKey('type');
    Object.entries(facilitiesByType)
      .sort(([c1, f1], [c2, f2]) => sortByType(f1[0], f2[0]))
      .forEach(([category, facilities]) => {
        const currentColumns = facilities
          .sort(getSortByKey('name'))
          .filter(({ code }) => orgUnitsWithData.has(code))
          .map(({ code: key, name }) => ({
            key,
            title: fixedColumnTitle || name,
          }));
        if (currentColumns.length === 0) {
          return;
        }

        if (this.entity.isFacility()) {
          columns.push(...currentColumns);
        } else {
          columns.push({ category, columns: currentColumns });
        }
      });

    return columns;
  }
}

export const organisationUnitTable = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new OrganisationUnitTableDataBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
