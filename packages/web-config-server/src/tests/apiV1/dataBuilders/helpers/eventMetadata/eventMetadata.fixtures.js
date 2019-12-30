export const ORG_UNITS = [
  {
    code: 'TO_Nukunuku',
    name: 'Nukunuku',
  },
];

export const EVENTS = {
  objectDataValue: {
    orgUnit: 'TO_Nukunuku',
    dataValues: {
      CD1: { storedBy: 'User1', dataElement: 'CD1', value: 1 },
    },
  },
  objectDataValues: {
    orgUnit: 'TO_Nukunuku',
    dataValues: {
      CD1: { storedBy: 'User1', dataElement: 'CD1', value: 1 },
      CD2: { storedBy: 'User2', dataElement: 'CD2', value: 2 },
    },
  },
  objectNoDataValues: {
    orgUnit: 'TO_Nukunuku',
    dataValues: {},
  },
  arrayDataValue: {
    orgUnit: 'TO_Nukunuku',
    dataValues: [{ storedBy: 'User1', dataElement: 'CD1', value: 1 }],
  },
  arrayDataValues: {
    orgUnit: 'TO_Nukunuku',
    dataValues: [
      { storedBy: 'User1', dataElement: 'CD1', value: 1 },
      { storedBy: 'User2', dataElement: 'CD2', value: 2 },
    ],
  },
  arrayNoDataValues: {
    orgUnit: 'TO_Nukunuku',
    dataValues: [],
  },
  unknownOrgUnit: {
    orgUnit: 'Unknown_Org_Unit',
    dataValues: {
      CD1: { storedBy: 'User3', dataElement: 'CD1', value: 3 },
    },
  },
};
