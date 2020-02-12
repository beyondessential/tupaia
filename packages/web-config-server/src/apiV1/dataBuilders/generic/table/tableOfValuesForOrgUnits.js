/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { average, getDotColorFromRange } from '/apiV1/dataBuilders/helpers';

class TableOfValuesForOrgUnitsBuilder extends DataBuilder {
  async build(viewJson) {
    const data = {
      rows: await this.buildRows(viewJson),
      columns: await this.buildColumns(),
    };

    return data;
  }

  async buildRows(viewJson) {
    const { rows, columns } = this.config;
    const columnKeys = columns.map(c => c.key);
    const dataElementCodes = rows.map(dx => dx.dataElement);
    let dataElementCodesToName = {};
    const dataCategories = new Map(rows.map(dx => [dx.dataElement, dx.categoryId]));
    const dataValues = [];

    for (const { key: organisationUnitCode } of columns) {
      const { results, metadata } = await this.getAnalytics({
        dataElementCodes,
        organisationUnitCode,
        outputIdScheme: 'code',
      });

      dataElementCodesToName = metadata.dataElementCodeToName;
      dataValues.push(results);
    }

    const flattenedValues = [].concat(...dataValues);

    const sortedValues = flattenedValues.reduce(
      (valuesPerElement, { dataElement, value, organisationUnit }) => {
        const existing = valuesPerElement[dataElement] || {};

        return {
          ...valuesPerElement,
          [dataElement]: {
            ...existing,
            [organisationUnit]: value,
            dataElement: dataElementCodesToName[dataElement],
            categoryId: dataCategories.get(dataElement),
          },
        };
      },
      {},
    );

    const rowData = Object.values(sortedValues);

    if (this.config.showCategoryValues) {
      const columnData = average(columns, rowData);

      const columnDataWithDots = columnData.map(cd => {
        const transformedData = { ...cd };
        columnKeys.forEach(
          e =>
            (transformedData[e] = {
              ...getDotColorFromRange(viewJson.categoryPresentationOptions, cd[e]),
              description: `Averaged score: ${cd[e]}`,
            }),
        );

        return transformedData;
      });

      return [...rowData, ...columnDataWithDots];
    }
    return rowData;
  }

  async buildColumns() {
    const { columns } = this.config;
    const columnData = [];

    for (const { key } of columns) {
      const organisationUnit = await this.dhisApi.getOrganisationUnits({
        filter: [{ code: key }],
        fields: 'id, name',
      });
      columnData.push({ key, title: organisationUnit[0].name });
    }

    return columnData;
  }
}

export const tableOfValuesForOrgUnits = async (
  { dataBuilderConfig, viewJson, query, entity },
  dhisApi,
) => {
  const builder = new TableOfValuesForOrgUnitsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build(viewJson);
};
