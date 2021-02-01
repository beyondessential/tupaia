const CATCHMENT_POPULATION = 'FF7';
const WEEKDAY = 'BCD39';
const SATURDAY = 'BCD41';
const SUNDAY = 'BCD39';

export const basicDataFacility = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes, dataServices } = dataBuilderConfig;
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);

  const returnData = [];

  const addRow = (dataElementValue, dataElementName) => {
    const returnedRow = {
      value: dataElementValue,
      name: dataElementName,
    };
    returnData.push(returnedRow);
  };

  const getOpeningDays = () => {
    if (openingDays[0] === 1) {
      if (openingDays[2] === 1) {
        return 'Mon - Sun';
      }
      if (openingDays[1] === 1) {
        return 'Mon - Sat';
      }
      return 'Mon - Fri';
    }
    if (openingDays[1] === 1) {
      if (openingDays[2] === 1) {
        return 'Sat - Sun';
      }
      return 'Sat';
    }
    if (openingDays[2] === 2) {
      return 'Sun';
    }
    return '-';
  };

  const openingDays = [0, 0, 0];
  let numberOfStaff = 0;
  results.forEach(row => {
    switch (row.dataElement) {
      case CATCHMENT_POPULATION:
        addRow(row.value, 'Catchment population');
        break;
      case WEEKDAY:
        openingDays[0] = 1;
        break;
      case SATURDAY:
        openingDays[1] = 1;
        break;
      case SUNDAY:
        openingDays[2] = 1;
        break;
      default:
        numberOfStaff += row.value;
        break;
    }
  });
  addRow(getOpeningDays(), 'Opening Days');
  addRow(numberOfStaff, 'Number of staff working');
  return { data: returnData };
};
