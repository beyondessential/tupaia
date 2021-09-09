import { convertDateRangeToPeriodString } from '@tupaia/utils';

const AFFECTED_STATUS_DATA_ELEMENT_CODE = 'DP_NEW008';

// Counts not calculated from survey question
const TO_BE_COMPLETED = 'To be completed';

export const countDisasterAffectedFacilitiesByStatus = async (
  { models, entity, dataBuilderConfig, query, fetchHierarchyId },
  aggregator,
  dhisApi,
) => {
  const { disasterStartDate, disasterEndDate } = query;
  const { dataServices, optionSetCode } = dataBuilderConfig;

  if (!disasterStartDate) return { data: [] }; // show no data message in view.

  const period = convertDateRangeToPeriodString(disasterStartDate, disasterEndDate || Date.now());
  const hierarchyId = await fetchHierarchyId();
  const facilities = await entity.getDescendantsOfType(hierarchyId, models.entity.types.FACILITY);
  const options = await dhisApi.getOptionSetOptions({ code: optionSetCode });
  const { results } = await aggregator.fetchAnalytics([AFFECTED_STATUS_DATA_ELEMENT_CODE], {
    ...query,
    dataServices,
    period,
  });

  /* eslint-disable no-param-reassign */
  const returnData = results.reduce(
    (statusCounts, result) => {
      const optionValue = options[result.value];
      if (!statusCounts[optionValue]) statusCounts[optionValue] = { name: optionValue, value: 0 };
      statusCounts[optionValue].value += 1;

      return statusCounts;
    },
    {
      // each facility with a completed survey will be mapped to one of the status' above,
      // so the difference between results and all facilities is = to
      // the amount of facilities that haven't completed the survey.
      [TO_BE_COMPLETED]: { name: TO_BE_COMPLETED, value: facilities.length - results.length },
    },
  );
  /* eslint-enable no-param-reassign */

  return { data: Object.values(returnData) };
};
