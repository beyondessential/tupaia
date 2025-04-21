/* eslint-disable @typescript-eslint/no-non-null-assertion */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import pickBy from 'lodash.pickby';
import { DataElement, DataSource, DhisAnalyticDimension, DhisAnalytics } from '../types';
import { Values } from '../../../types';
import { formatInboundDataElementName } from './formatDataElementName';

const DIMENSIONS: Record<string, DhisAnalyticDimension> = {
  DATA_ELEMENT: 'dx',
  CATEGORY_OPTION_COMBO: 'co',
};

type MetadataItem = Values<DhisAnalytics['metaData']['items']>;

const createDataElementKey = (dataElement: string, categoryOptionCombo?: string) =>
  categoryOptionCombo ? `${dataElement}:${categoryOptionCombo}` : dataElement;

export class InboundAnalyticsTranslator {
  private headers?: DhisAnalytics['headers'];
  private rows?: DhisAnalytics['rows'];
  private metadata?: DhisAnalytics['metaData'];
  private dataSources?: DataElement[];
  private dataElementKeyToSourceCode?: Record<string, string>;
  private categoryOptionsCombos?: Record<string, MetadataItem>;

  private findDimensionRowIndex = (dimension: string) =>
    this.headers!.findIndex(({ name }) => name === dimension);

  private getDimensionIds = (dimension: DhisAnalyticDimension) =>
    this.metadata!.dimensions[dimension] || [];

  private getDimensionItems = (dimension: DhisAnalyticDimension) => {
    const { items, dimensions } = this.metadata!;
    return pickBy(items, (_, id: string) => dimensions[dimension].includes(id));
  };

  private createCheckIsDimensionItem = (dimension: DhisAnalyticDimension) => (item: MetadataItem) =>
    this.getDimensionIds(dimension).includes(item.uid);

  public translate(
    { headers, rows, metaData: metadata }: DhisAnalytics,
    dataSources: DataElement[],
  ): DhisAnalytics {
    this.headers = headers;
    this.rows = rows;
    this.metadata = metadata;
    this.dataSources = dataSources;
    this.dataElementKeyToSourceCode = this.getDataElementKeyToSourceCode();
    this.categoryOptionsCombos = this.getDimensionItems(DIMENSIONS.CATEGORY_OPTION_COMBO);

    return {
      headers: this.translateHeaders(),
      rows: this.translateRows(),
      metaData: this.translateMetadata(),
    };
  }

  private getDataElementKeyToSourceCode() {
    return this.dataSources!.reduce<Record<string, DataSource['code']>>(
      (keyToSourceCode, dataSource) => {
        const { dataElementCode, config } = dataSource;
        const key = createDataElementKey(dataElementCode, config.categoryOptionCombo);
        keyToSourceCode[key] = dataSource.code;
        return keyToSourceCode;
      },
      {},
    );
  }

  private translateHeaders() {
    return this.headers!.filter(
      ({ name }) => name !== DIMENSIONS.CATEGORY_OPTION_COMBO,
    ) as DhisAnalytics['headers'];
  }

  private translateRows() {
    const dataElementRowIndex = this.findDimensionRowIndex(DIMENSIONS.DATA_ELEMENT);
    const coComboRowIndex = this.findDimensionRowIndex(DIMENSIONS.CATEGORY_OPTION_COMBO);

    if (coComboRowIndex < 0) {
      return this.rows as string[][];
    }

    const coCombosById = keyBy(this.categoryOptionsCombos, 'uid');
    return (this.rows as string[][])
      .map(row => {
        const coComboId = row[coComboRowIndex];
        const { code: coComboCode } = coCombosById[coComboId];
        const categoryComboIsUsed = coComboCode !== 'default';

        if (categoryComboIsUsed && dataElementRowIndex >= 0) {
          const dataElement = row[dataElementRowIndex];
          const dataElementKey = createDataElementKey(dataElement, coComboCode);
          const sourceCode = this.dataElementKeyToSourceCode![dataElementKey];
          if (!sourceCode) {
            return null; // no matching source code, this category option combo wasn't requested
          }
          row.splice(dataElementRowIndex, 1, sourceCode);
        }

        row.splice(coComboRowIndex, 1);
        return row;
      })
      .filter(row => !!row) as string[][]; // drop those that weren't requested
  }

  private translateMetadata() {
    const { items, dx } = this.getTranslatedItemsAndDx();
    const dimensions = this.translateMetadataDimensions(dx);
    return { items, dimensions };
  }

  private getTranslatedItemsAndDx() {
    const { items } = this.metadata!;
    const checkIsDataElementItem = this.createCheckIsDimensionItem(DIMENSIONS.DATA_ELEMENT);
    const checkIsCategoryOptionComboItem = this.createCheckIsDimensionItem(
      DIMENSIONS.CATEGORY_OPTION_COMBO,
    );
    const coCombosByCode = keyBy(this.categoryOptionsCombos, 'code');
    const dataElementCodeToDataSources = groupBy(
      this.dataSources,
      ({ dataElementCode }) => dataElementCode,
    );

    const translatedItems: Record<string, MetadataItem> = {};
    const translatedDx: string[] = [];
    Object.values(items).forEach(item => {
      const { uid } = item;

      if (checkIsCategoryOptionComboItem(item) || uid === DIMENSIONS.CATEGORY_OPTION_COMBO) {
        // Remove category option combo data from the results
        return;
      }
      if (!checkIsDataElementItem(item)) {
        // Non data element item, no need to translate anything
        translatedItems[uid] = item as MetadataItem;
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

  private getTranslatedDataElementItemAndDx(
    item: MetadataItem,
    dataElementCodeToDataSources: Record<string, DataElement[]>,
    coCombosByCode: Record<string, { name: string }>,
  ) {
    const { uid, code, name } = item;

    const translatedItems: Record<string, MetadataItem> = {};
    const translatedDx: string[] = [];
    const dataSourcesForElement = dataElementCodeToDataSources[code];
    dataSourcesForElement.forEach(dataSource => {
      const coComboCode = dataSource.config.categoryOptionCombo as string;
      const { name: coComboName } = coCombosByCode[coComboCode] || {};
      const translatedId = createDataElementKey(uid, coComboCode);
      translatedDx.push(translatedId);
      const dataElementKey = createDataElementKey(code, coComboCode);
      translatedItems[translatedId] = {
        ...item,
        uid: translatedId,
        code: this.dataElementKeyToSourceCode![dataElementKey],
        name: formatInboundDataElementName(name, coComboName),
      };
    });

    return { items: translatedItems, dx: translatedDx };
  }

  private translateMetadataDimensions(translatedDx: string[]) {
    const { dimensions } = this.metadata!;
    const { dx, co, ...restOfDimensions } = dimensions;
    return { dx: translatedDx, ...restOfDimensions };
  }
}
