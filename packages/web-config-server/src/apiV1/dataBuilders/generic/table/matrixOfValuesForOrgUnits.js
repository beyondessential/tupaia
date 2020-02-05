/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class MatrixOfValuesForOrgUnitsBuilder extends DataBuilder {
  async build() {
    const data = {
      rows: await this.buildRows(),
      columns: await this.buildColumns(),
    };

    return data;
  }

  async buildRows() {
    const { rows, columns } = this.config;
    const dataElementCodes = rows.map(dx => dx.dataElement);
    const dataCategories = new Map(rows.map(dx => [dx.dataElement, dx.categoryId]));
    const dataValues = [];

    for (const { code: organisationUnitCode } of columns) {
      const { results } = await this.getAnalytics({
        dataElementCodes,
        organisationUnitCode,
        outputIdScheme: 'code',
      });

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
            dataElement: dataElement,
            categoryId: dataCategories.get(dataElement),
          },
        };
      },
      {},
    );

    const rowData = Object.values(sortedValues);

    const columnKeys = columns.map(c => c.key);
    const categoryRows = rowData.reduce((categoryValues, data) => {
      const existing = categoryValues[data.categoryId] || {};
      const newCategoryValues = {
        ...categoryValues,
        [data.categoryId]: { ...existing, dataElement: data.categoryId },
      };

      for (const key of columnKeys) {
        newCategoryValues[data.categoryId][key]
          ? newCategoryValues[data.categoryId][key].push(data[key])
          : (newCategoryValues[data.categoryId][key] = [data[key]]);
      }

      return newCategoryValues;
    }, {});

    const categoryData = [];
    for (const value of Object.values(categoryRows)) {
      const row = { categoryKey: value.dataElement };
      for (const key of columnKeys) {
        row[key] = value[key].reduce((a, b) => a + b, 0) / value[key].length;
      }
      categoryData.push(row);
    }

    return [...rowData, ...categoryData];
  }

  async buildColumns() {
    const { columns } = this.config;
    const columnData = [];

    for (const { code, key } of columns) {
      const organisationUnit = await this.dhisApi.getOrganisationUnits({
        filter: [{ code }],
        fields: 'id, name',
      });
      columnData.push({ code, key, title: organisationUnit[0].name });
    }

    return columnData;
  }

  buildData() {}
}

export const matrixOfValuesForOrgUnits = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new MatrixOfValuesForOrgUnitsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
