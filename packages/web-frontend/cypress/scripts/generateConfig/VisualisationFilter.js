/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { camel } from 'case';
import { keyBy, upperFirst, mapKeys } from 'lodash';

import { getUniqueEntries, hasIntersection, toArray } from '@tupaia/utils';

class VisualisationFilter {
  constructor(db, filter) {
    this.db = db;
    this.filter = filter;
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  fetchRecords = async objectUrls => {
    throw new Error('Any subclass of VisualisationFilter must implement the "fetchRecords" method');
  };

  /**
   * @abstract
   */
  getKey = () => {
    throw new Error('Any subclass of VisualisationFilter must implement the "getKey" method');
  };

  /**
   * @abstract
   */
  getBuilderKey = () => {
    throw new Error(
      'Any subclass of VisualisationFilter must implement the "getBuilderKey" method',
    );
  };

  /**
   * @protected
   */
  getName = () => 'visualisation';

  apply = async objectUrls => {
    if (Object.keys(this.filter).length === 0) {
      return objectUrls;
    }

    const visualKey = this.getKey();
    const records = await this.fetchRecords(objectUrls);
    // Camel case all the record keys
    const transformedRecords = records.map(r => mapKeys(r, (_, key) => camel(key)));
    const recordsByKey = keyBy(transformedRecords, visualKey);

    const filterUrl = url =>
      Object.entries(this.filter).some(([key, targetValue]) => {
        const record = recordsByKey[url[visualKey]];
        if (!record) {
          throw new Error(
            `${upperFirst(this.getName())} with code "${url.code}" was not found in the database`,
          );
        }

        const isBuilderFilter = key === this.getBuilderKey();
        const value = isBuilderFilter
          ? this.getBuildersInRecord(recordsByKey[url[visualKey]])
          : url[key];
        return hasIntersection(toArray(targetValue), toArray(value));
      });

    return objectUrls.filter(filterUrl);
  };

  getBuildersInRecord = record => {
    const builderKey = this.getBuilderKey();
    const nestedBuilders = Object.values(record[`${builderKey}Config`][`${builderKey}s`] || {}).map(
      nestedConfig => nestedConfig[builderKey],
    );
    return getUniqueEntries([record[builderKey], ...nestedBuilders]);
  };
}

export class DashboardReportFilter extends VisualisationFilter {
  fetchRecords = async objectUrls => {
    const dashboardItems = await this.db.find('dashboard_item', {
      code: objectUrls.map(u => u.code),
    });
    const legacyDashboardItems = dashboardItems.filter(di => di.legacy);
    const legacyReports = await this.db.find('legacy_report', {
      code: legacyDashboardItems.map(di => di.report_code),
    });
    const legacyReportById = keyBy(legacyReports, 'code');
    return dashboardItems.map(di => {
      const legacyReport = di.legacy ? legacyReportById[di.report_code] : {};

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

  getKey = () => 'code';

  getBuilderKey = () => 'dataBuilder';

  getName = () => 'dashboard report';
}

export class MapOverlayFilter extends VisualisationFilter {
  fetchRecords = async objectUrls =>
    this.db.find('mapOverlay', {
      id: objectUrls.map(u => u.id).flat(),
    });

  getKey = () => 'id';

  getBuilderKey = () => 'measureBuilder';

  getName = () => 'map overlay';
}
