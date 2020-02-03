import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { getFacilityStatusCounts } from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const POPULATION = 'X09CcG0lHsP';
const NUMBER_OF_DOCTORS = 'jxodPel43S3';
const NUMBER_OF_NURSES = 'VCLujRxNl0K';

// # of doctors, nurses and facilities per 10k people
class CountDataElement10kPaxBuilder extends DataBuilder {
  async build() {
    const { results } = await this.getAnalytics(this.config);
    const { numberOperational } = await getFacilityStatusCounts(this.entity.code);
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
      addRow(parseFloat(partialDoctors * 10000).toFixed(2), 'Doctors/10,000 pop');
      const partialNurses = totalOfNurses / population;
      addRow(parseFloat(partialNurses * 10000).toFixed(2), 'Nurses/10,000 pop');
      const partialFacilities = numberOperational / population;
      addRow(parseFloat(partialFacilities * 10000).toFixed(2), 'Facilities/10,000 pop');
    }
    return { data: returnData };
  }
}

export const countDataElement10kPax = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountDataElement10kPaxBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY,
  );
  return builder.build();
};
