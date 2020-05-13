const DATA_TYPE_TO_FUNC = {
  number: index => index,
  bool: index => index % 2,
};

// Add any codes required here
const validCodeConfig = {
  SchPop001: { type: 'number' },
};

const generateSpoofData = (dataElementCode, orgUnits) => {
  const type = validCodeConfig[dataElementCode].type;
  const dataGenerarator = DATA_TYPE_TO_FUNC[type];
  return orgUnits.map((school, index) => {
    return {
      dataElement: dataElementCode,
      period: '20200304',
      organisationUnit: school,
      value: dataGenerarator(index),
    };
  });
};

export const getSpoofData = (dataSourceSpec, options) => {
  const dataElementCode = dataSourceSpec.code[0];
  if (!validCodeConfig[dataElementCode]) {
    return [];
  }
  // Doesn't return any metadata
  return { results: generateSpoofData(dataElementCode, options.organisationUnitCodes) };
};
