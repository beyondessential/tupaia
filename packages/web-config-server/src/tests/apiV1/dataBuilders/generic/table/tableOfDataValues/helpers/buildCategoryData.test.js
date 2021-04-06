import { expect } from 'chai';

import { buildCategoryData } from '/apiV1/dataBuilders/generic/table/tableOfDataValues/helpers';

const rows = [
  { categoryId: 'ACT', dataElement: 'ACT 6x1 (Coartem)' },
  { categoryId: 'ACT', dataElement: 'ACT 6x2 (Coartem)' },
  { categoryId: 'ACT', dataElement: 'ACT 6x3 (Coartem)' },
  {
    categoryId: 'ACT',
    dataElement: 'ACT 6x4 (Coartem)',
    Col1: 1,
    Col2: 1,
    Col3: 1,
    Col4: 1,
    Col5: 1,
    Col6: 1,
    Col7: 1,
    Col8: 1,
  },
  { categoryId: 'G6PD', dataElement: 'G6PD RDT' },
  { categoryId: 'ORS', dataElement: 'ORS (Closing stock)' },
  { categoryId: 'Primaquine', dataElement: 'Primaquine 15 mg' },
  { categoryId: 'Primaquine', dataElement: 'Primaquine 7.5 mg' },
  {
    categoryId: 'RDT',
    dataElement: 'Malaria Rapid Diagnostic Test (RDT)',
    Col1: 25,
    Col2: 9,
    Col3: 17,
    Col4: 20,
    Col5: 14,
    Col6: 15,
    Col7: 11,
    Col8: 20,
  },
  { categoryId: 'Artesunate', dataElement: 'Artesunate 60mg' },
  { categoryId: 'Paracetamol', dataElement: 'Paracetamol' },
];
const categoryAggregatorConfig = {
  type: '$condition',
  conditions: [
    {
      key: 'red',
      condition: {
        in: [null, 0],
      },
    },
    {
      key: 'green',
      condition: {
        '>': 0,
      },
    },
    {
      key: 'orange',
      condition: {
        someNotAll: { '>': 0 },
      },
    },
  ],
};
const columns = [
  { key: 'Col1', title: 'LA-BL-06 DH' },
  { key: 'Col2', title: 'LA-BL-06 HC Chomthong' },
  { key: 'Col3', title: 'LA-BL-06 HC Thadua (Viangthong)' },
  { key: 'Col4', title: 'LA-BL-06 HC Thongmixai (Viangthong)' },
  { key: 'Col5', title: 'LA-BL-06 HC Namkang' },
  { key: 'Col6', title: 'LA-BL-06 HC Namuang (Viangthong)' },
  { key: 'Col7', title: 'LA-BL-06 HC Nanyang (Viangthong)' },
  { key: 'Col8', title: 'LA-BL-06 HC Sivilai (Viangthong)' },
];
const expectedValue = {
  ACT: {
    Col1: 'orange',
    Col2: 'orange',
    Col3: 'orange',
    Col4: 'orange',
    Col5: 'orange',
    Col6: 'orange',
    Col7: 'orange',
    Col8: 'orange',
  },
  G6PD: {
    Col1: 'red',
    Col2: 'red',
    Col3: 'red',
    Col4: 'red',
    Col5: 'red',
    Col6: 'red',
    Col7: 'red',
    Col8: 'red',
  },
  ORS: {
    Col1: 'red',
    Col2: 'red',
    Col3: 'red',
    Col4: 'red',
    Col5: 'red',
    Col6: 'red',
    Col7: 'red',
    Col8: 'red',
  },
  Primaquine: {
    Col1: 'red',
    Col2: 'red',
    Col3: 'red',
    Col4: 'red',
    Col5: 'red',
    Col6: 'red',
    Col7: 'red',
    Col8: 'red',
  },
  RDT: {
    Col1: 'green',
    Col2: 'green',
    Col3: 'green',
    Col4: 'green',
    Col5: 'green',
    Col6: 'green',
    Col7: 'green',
    Col8: 'green',
  },
  Artesunate: {
    Col1: 'red',
    Col2: 'red',
    Col3: 'red',
    Col4: 'red',
    Col5: 'red',
    Col6: 'red',
    Col7: 'red',
    Col8: 'red',
  },
  Paracetamol: {
    Col1: 'red',
    Col2: 'red',
    Col3: 'red',
    Col4: 'red',
    Col5: 'red',
    Col6: 'red',
    Col7: 'red',
    Col8: 'red',
  },
};

describe('buildCategoryData()', () => {
  describe('type: $condition', () => {
    it('condition: someNotAll', () => {
      expect(buildCategoryData({ rows, categoryAggregatorConfig, columns })).to.deep.equal(
        expectedValue,
      );
    });
  });
});
