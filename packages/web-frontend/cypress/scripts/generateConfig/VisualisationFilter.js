/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { keyBy, upperFirst } from 'lodash';

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

    const records = await this.fetchRecords(objectUrls);
    const recordsById = keyBy(records, 'id');

    const filterUrl = url =>
      Object.entries(this.filter).some(([key, targetValue]) => {
        const record = recordsById[url.id];
        if (!record) {
          throw new Error(
            `${upperFirst(this.getName())} with id "${url.id}" was not found in the database`,
          );
        }

        const isBuilderFilter = key === this.getBuilderKey();
        const value = isBuilderFilter ? this.getBuildersInRecord(recordsById[url.id]) : url[key];
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
  fetchRecords = async objectUrls =>
    this.db.find('dashboardReport', {
      id: objectUrls.map(u => u.id),
      drillDownLevel: null, // Drill down reports are not currently supported in e2e tests
    });

  getBuilderKey = () => 'dataBuilder';

  getName = () => 'dashboard report';
}

export class MapOverlayFilter extends VisualisationFilter {
  fetchRecords = async objectUrls =>
    this.db.find('mapOverlay', {
      id: objectUrls.map(u => u.id).flat(),
    });

  getBuilderKey = () => 'measureBuilder';

  getName = () => 'map overlay';
}
