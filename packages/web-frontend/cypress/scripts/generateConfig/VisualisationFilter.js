/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import assert from 'assert';
import { camel } from 'case';
import { keyBy, upperFirst, mapKeys } from 'lodash';

import { getUniqueEntries, hasIntersection, toArray } from '@tupaia/utils';

class VisualisationFilter {
  static key = null;

  static builderKey = null;

  static name = 'visualisation';

  constructor(db, filter) {
    this.db = db;
    this.filter = filter;
    this.validate();
  }

  validate() {
    assert.notStrictEqual(this.key, null);
    assert.notStrictEqual(this.builderKey, null);
  }

  get key() {
    return this.constructor.key;
  }

  get builderKey() {
    return this.constructor.builderKey;
  }

  get name() {
    return this.constructor.name;
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  fetchRecords = async objectUrls => {
    throw new Error('Any subclass of VisualisationFilter must implement the "fetchRecords" method');
  };

  apply = async objectUrls => {
    if (Object.keys(this.filter).length === 0) {
      return objectUrls;
    }

    const records = await this.fetchRecords(objectUrls);
    // Camel case all the record keys
    const transformedRecords = records.map(r => mapKeys(r, (_, propertyKey) => camel(propertyKey)));
    const recordsByKey = keyBy(transformedRecords, this.key);

    const filterUrl = url =>
      Object.entries(this.filter).some(([filterKey, targetValue]) => {
        const record = recordsByKey[url[this.key]];
        if (!record) {
          throw new Error(
            `${upperFirst(this.name)} with ${this.key} "${
              url[this.key]
            }" was not found in the database`,
          );
        }

        // skip all the records that do not have the filter key
        if (record[filterKey] === undefined || record[filterKey] === null) {
          return false;
        }

        const isBuilderFilter = filterKey === this.builderKey;
        const value = isBuilderFilter ? this.getBuildersInRecord(record) : url[filterKey];
        return hasIntersection(toArray(targetValue), toArray(value));
      });

    return objectUrls.filter(filterUrl);
  };

  getBuildersInRecord = record => {
    const nestedBuilders = Object.values(
      record[`${this.builderKey}Config`][`${this.builderKey}s`] || {},
    ).map(nestedConfig => nestedConfig[this.builderKey]);
    return getUniqueEntries([record[this.builderKey], ...nestedBuilders]);
  };
}

export class DashboardReportFilter extends VisualisationFilter {
  static key = 'code';

  static builderKey = 'dataBuilder';

  static name = 'dashboard report';

  fetchRecords = async objectUrls => {
    const objectUrlsByCode = keyBy(objectUrls, 'code');

    const dashboardItems = await this.db
      .find('dashboard_item', { code: objectUrls.map(u => u.code) })
      .map(di => ({ ...di, dashboard: objectUrlsByCode[di.code].dashboard }));

    const legacyDashboardItems = dashboardItems.filter(di => di.legacy);
    const legacyReports = await this.db.find('legacy_report', {
      code: legacyDashboardItems.map(di => di.report_code),
    });
    const legacyReportByCode = keyBy(legacyReports, 'code');

    return dashboardItems.map(di => {
      const legacyReport = di.legacy ? legacyReportByCode[di.report_code] : null;

      if (legacyReport) {
        return {
          ...di,
          data_builder: legacyReport.data_builder,
          data_builder_config: legacyReport.data_builder_config,
        };
      }

      return di;
    });
  };
}

export class MapOverlayFilter extends VisualisationFilter {
  static key = 'id';

  static builderKey = 'measureBuilder';

  static name = 'map overlay';

  fetchRecords = async objectUrls =>
    this.db.find('map_overlay', {
      id: objectUrls.map(u => u.id).flat(),
    });
}
