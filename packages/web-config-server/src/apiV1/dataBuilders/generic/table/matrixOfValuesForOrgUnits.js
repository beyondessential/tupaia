/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class MatrixOfValuesForOrgUnitsBuilder extends DataBuilder {
  async build() {
    const r = await this.buildRows();
    const c = await this.buildColumns();

    return { data: [] };
  }

  async buildRows() {
    const { rows, columns, categories } = this.config;

    const dataElementCodes = rows.map(dx => dx.dataElement);
    const organisationUnits = columns.map(ou => ou.code);

    const dataValues = [];
    const rowData = [];

    for (const { code: organisationUnitCode } of columns) {
      const { results } = await this.getAnalytics({
        dataElementCodes,
        organisationUnitCode,
        outputIdScheme: 'code',
      });

      dataValues.push(results);
    }

    console.log('TCL: MatrixOfValuesForOrgUnitsBuilder -> buildRows -> dataValues', dataValues);
  }

  async buildColumns() {
    const { columns } = this.config;
    const columnData = [];

    for (const { code, key } of columns) {
      const organisationUnit = await this.dhisApi.getOrganisationUnits({
        filter: [{ code }],
        fields: 'id, name',
      });
      columnData.push({ code, key, name: organisationUnit[0].name });
    }

    return columnData;
  }

  buildData() {}
}

export const matrixOfValuesForOrgUnits = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new MatrixOfValuesForOrgUnitsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};

const config = {
  columns: [{ code: 'country_code', key: 'country_code' }],
  rows: [
    {
      dataElement: 'name of data',
      category_id: 'category_key',
      country_code: 0,
      country_code: 0,
      country_code: 0,
      country_code: 0,
      country_code: 0,
    },
  ],
  categories: [
    {
      key: 'C1_Legislation_Financing',
      title: 'Legislation and financing',
      value: 'AVERAGE',
    },
    { key: 'C2_IHR_Coordination', title: 'IHR Coordination' },
    { key: 'C3_Zoonotic_Events', title: 'Zoonotic events and the human-animal interface' },
    { key: 'C4_Food_Safety', title: 'Food safety' },
    { key: 'C5_Laboratory', title: 'Laboratory' },
    { key: 'C6_Surveillance', title: 'Surveillance' },
    { key: 'C7_Human_Resources', title: 'Human resources' },
    { key: 'C8_Health_Emergency', title: 'National health emergency framework' },
    { key: 'C9_Health_Service', title: 'Health service provision' },
    { key: 'C10_Risk_Communication', title: 'Risk communication' },
    { key: 'C11_Points_Of_Entry', title: 'Points of entry (poe)' },
    { key: 'C12_Chemical_Events', title: 'Chemical events' },
    { key: 'C13_Radiation_Emergencies', title: 'Radiation emergencies' },
  ],
};

// const c = {
//   columns: [{ code: 'country_code', key: 'country_code', title: 'country_name' }],
//   rows: [
//     {
//       dataElement: 'name of data',
//       name: '',
//       category_id: category_key,
//       country_code: value,
//       country_code: value,
//       country_code: value,
//       country_code: value,
//       country_code: value,
//     },
//     {},
//   ],
//   categories: [
//     {
//       key: 'C1_Legislation_Financing',
//       title: 'Legislation and financing',
//       cells: [col1Val, col2Val],
//     },
//     { key: 'C2_IHR_Coordination', title: 'IHR Coordination' },
//     { key: 'C3_Zoonotic_Events', title: 'Zoonotic events and the human-animal interface' },
//     { key: 'C4_Food_Safety', title: 'Food safety' },
//     { key: 'C5_Laboratory', title: 'Laboratory' },
//     { key: 'C6_Surveillance', title: 'Surveillance' },
//     { key: 'C7_Human_Resources', title: 'Human resources' },
//     { key: 'C8_Health_Emergency', title: 'National health emergency framework' },
//     { key: 'C9_Health_Service', title: 'Health service provision' },
//     { key: 'C10_Risk_Communication', title: 'Risk communication' },
//     { key: 'C11_Points_Of_Entry', title: 'Points of entry (poe)' },
//     { key: 'C12_Chemical_Events', title: 'Chemical events' },
//     { key: 'C13_Radiation_Emergencies', title: 'Radiation emergencies' },
//   ],
// };
