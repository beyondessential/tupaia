/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { average } from '/apiV1/dataBuilders/helpers';

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
    let dataElementCodesToName = {};
    const dataCategories = new Map(rows.map(dx => [dx.dataElement, dx.categoryId]));
    const dataValues = [];

    for (const { code: organisationUnitCode } of columns) {
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

    if (this.config.showCategoryValues) return [...rowData, ...average(columns, rowData)];
    return rowData;
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
