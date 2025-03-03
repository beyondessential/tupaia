import { getFacilityStatusCounts } from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const POPULATION = 'POPULATION';
const NUMBER_OF_DOCTORS = 'BCD46';
const NUMBER_OF_NURSES = 'BCD48';

// # of doctors, nurses and facilities per 10k people
class CountDataElement10kPaxBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const { numberOperational } = await getFacilityStatusCounts(this.aggregator, this.entity.code);
    const returnData = [];

    const addRow = (dataElementValue, dataElementName) => {
      const returnedRow = {
        value: dataElementValue,
        name: dataElementName,
      };
      returnData.push(returnedRow);
    };

    let population = 0;
    let totalOfDoctors = 0;
    let totalOfNurses = 0;
    results.forEach(row => {
      if (row.dataElement === POPULATION) population = row.value;
      else if (row.dataElement === NUMBER_OF_DOCTORS) totalOfDoctors += row.value;
      else if (row.dataElement === NUMBER_OF_NURSES) totalOfNurses += row.value;
    });

    if (population !== 0) {
      addRow(population, 'Population');
      const partialDoctors = totalOfDoctors / population;
      addRow(Number.parseFloat(partialDoctors * 10000).toFixed(2), 'Doctors/10,000 pop');
      const partialNurses = totalOfNurses / population;
      addRow(Number.parseFloat(partialNurses * 10000).toFixed(2), 'Nurses/10,000 pop');
      const partialFacilities = numberOperational / population;
      addRow(Number.parseFloat(partialFacilities * 10000).toFixed(2), 'Facilities/10,000 pop');
    }
    return { data: returnData };
  }
}

export const countDataElement10kPax = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountDataElement10kPaxBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );
  return builder.build();
};
