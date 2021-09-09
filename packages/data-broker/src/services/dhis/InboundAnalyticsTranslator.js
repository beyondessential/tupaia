/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import pickBy from 'lodash.pickby';

const DIMENSIONS = {
  DATA_ELEMENT: 'dx',
  CATEGORY_OPTION_COMBO: 'co',
};

const createDataElementKey = (dataElement, categoryOptionCombo) =>
  categoryOptionCombo ? `${dataElement}:${categoryOptionCombo}` : dataElement;

export class InboundAnalyticsTranslator {
  findDimensionRowIndex = dimension => this.headers.findIndex(({ name }) => name === dimension);

  getDimensionIds = dimension => this.metadata.dimensions[dimension] || [];

  getDimensionItems = dimension => {
    const { items, dimensions } = this.metadata;
    return pickBy(items, (_, id) => dimensions[dimension].includes(id));
  };

  createCheckIsDimensionItem = dimension => item =>
    this.getDimensionIds(dimension).includes(item.uid);

  translate({ headers, rows, metaData: metadata }, dataSources) {
    this.headers = headers;
    this.rows = rows;
    this.metadata = metadata;
    this.dataSources = dataSources;
    this.dataElementKeyToSourceCode = this.getDataElementKeyToSourceCode(dataSources);
    this.categoryOptionsCombos = this.getDimensionItems(DIMENSIONS.CATEGORY_OPTION_COMBO);

    return {
      headers: this.translateHeaders(),
      rows: this.translateRows(),
      metaData: this.translateMetadata(),
    };
  }

  getDataElementKeyToSourceCode() {
    return this.dataSources.reduce((keyToSourceCode, dataSource) => {
      const { dataElementCode, config } = dataSource;
      const key = createDataElementKey(dataElementCode, config.categoryOptionCombo);
      return { ...keyToSourceCode, [key]: dataSource.code };
    }, {});
  }

  translateHeaders() {
    return this.headers.filter(({ name }) => name !== DIMENSIONS.CATEGORY_OPTION_COMBO);
  }

  translateRows() {
    const dataElementRowIndex = this.findDimensionRowIndex(DIMENSIONS.DATA_ELEMENT);
    const coComboRowIndex = this.findDimensionRowIndex(DIMENSIONS.CATEGORY_OPTION_COMBO);

    if (coComboRowIndex < 0) {
      return this.rows;
    }

    const coCombosById = keyBy(this.categoryOptionsCombos, 'uid');
    return this.rows
      .map(row => {
        const coComboId = row[coComboRowIndex];
        const { code: coComboCode } = coCombosById[coComboId];
        const categoryComboIsUsed = coComboCode !== 'default';

        if (categoryComboIsUsed && dataElementRowIndex >= 0) {
          const dataElement = row[dataElementRowIndex];
          const dataElementKey = createDataElementKey(dataElement, coComboCode);
          const sourceCode = this.dataElementKeyToSourceCode[dataElementKey];
          if (!sourceCode) {
            return null; // no matching source code, this category option combo wasn't requested
          }
          row.splice(dataElementRowIndex, 1, sourceCode);
        }

        row.splice(coComboRowIndex, 1);
        return row;
      })
      .filter(row => !!row); // drop those that weren't requested
  }

  translateMetadata() {
    const { items, dx } = this.getTranslatedItemsAndDx();
    const dimensions = this.translateMetadataDimensions(dx);
    return { items, dimensions };
  }

  getTranslatedItemsAndDx() {
    const { items } = this.metadata;
    const checkIsDataElementItem = this.createCheckIsDimensionItem(DIMENSIONS.DATA_ELEMENT);
    const checkIsCategoryOptionComboItem = this.createCheckIsDimensionItem(
      DIMENSIONS.CATEGORY_OPTION_COMBO,
    );
    const coCombosByCode = keyBy(this.categoryOptionsCombos, 'code');
    const dataElementCodeToDataSources = groupBy(
      this.dataSources,
      ({ dataElementCode }) => dataElementCode,
    );

    const translatedItems = {};
    const translatedDx = [];
    Object.values(items).forEach(item => {
      const { uid } = item;

      if (checkIsCategoryOptionComboItem(item) || uid === DIMENSIONS.CATEGORY_OPTION_COMBO) {
        // Remove category option combo data from the results
        return;
      }
      if (!checkIsDataElementItem(item)) {
        // Non data element item, no need to translate anything
        translatedItems[uid] = item;
        return;
      }

      const { items: newItems, dx: newDx } = this.getTranslatedDataElementItemAndDx(
        item,
        dataElementCodeToDataSources,
        coCombosByCode,
      );
      Object.assign(translatedItems, newItems);
      translatedDx.push(...newDx);
    });

    return { items: translatedItems, dx: translatedDx };
  }

  getTranslatedDataElementItemAndDx(item, dataElementCodeToDataSources, coCombosByCode) {
    const { uid, code, name } = item;

    const translatedItems = {};
    const translatedDx = [];
    const dataSourcesForElement = dataElementCodeToDataSources[code];
    dataSourcesForElement.forEach(dataSource => {
      const coComboCode = dataSource.config.categoryOptionCombo;
      const { name: coComboName } = coCombosByCode[coComboCode] || {};
      const translatedId = createDataElementKey(uid, coComboCode);
      translatedDx.push(translatedId);
      const dataElementKey = createDataElementKey(code, coComboCode);
      translatedItems[translatedId] = {
        ...item,
        uid: translatedId,
        code: this.dataElementKeyToSourceCode[dataElementKey],
        name: name + (coComboName ? ` - ${coComboName}` : ''),
      };
    });

    return { items: translatedItems, dx: translatedDx };
  }

  translateMetadataDimensions(translatedDx) {
    const { dimensions } = this.metadata;
    const { dx, co, ...restOfDimensions } = dimensions;
    return { dx: translatedDx, ...restOfDimensions };
  }
}
