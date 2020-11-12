import { getDataElementFromId } from '/apiV1/utils';
import { getMostRecentPeriod } from '@tupaia/utils';

export const multiDataValuesLatestSurvey = async (
  { dataBuilderConfig, entity },
  aggregator,
  dhisApi,
) => {
  const { surveyDataElementCode } = dataBuilderConfig;
  const surveyDatesResponseDataValues = await dhisApi.getDataValuesInSets(
    { dataElementGroupCode: surveyDataElementCode },
    entity,
  );
  const latestPeriod = getMostRecentPeriod(surveyDatesResponseDataValues.map(srv => srv.period));
  if (!latestPeriod) {
    return { data: [] };
  }
  const dataValues = await dhisApi.getDataValuesInSets(
    { ...dataBuilderConfig, period: latestPeriod },
    entity,
  );
  const returnData = [];
  if (dataValues) {
    await Promise.all(
      dataValues.map(async ({ dataElement: dataElementId, value, period }) => {
        const { name: dataElementName, optionSet } = await getDataElementFromId(
          dhisApi,
          dataElementId,
        );
        let valueToUse = value;
        if (optionSet && optionSet.id) {
          const options = await dhisApi.getOptionSetOptions({ id: optionSet.id });
          valueToUse = options[value];
        }

        // There could be multiple surveys completed within the given period,
        // should find the most recent one and use that.
        const duplicateIndex = returnData.findIndex(data => data.dataElement === dataElementId);
        if (duplicateIndex > -1 && returnData[duplicateIndex].period < period) {
          returnData[duplicateIndex] = {
            name: dataElementName || dataElementId,
            dataElement: dataElementId,
            value: valueToUse,
            period,
          };
        } else if (duplicateIndex === -1) {
          // no duplicate, push this value.
          returnData.push({
            name: dataElementName || dataElementId,
            dataElement: dataElementId,
            value: valueToUse,
            period,
          });
        }
      }),
    );
  }
  return { data: returnData };
};
